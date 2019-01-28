import { DataEntryList, IDataEntrySource } from './../../shared/models/data-entry.models';
import { UserService } from './../../../shared/services/user.service';
import { IUserInfo } from './../../../shared/models/user';
import { ApolloService } from '../../../shared/services/apollo.service';
import { DataEntryFormViewModel } from '../../data-entry.viewmodel';
import { ICustomData, ICustomSchemaInfo } from '../../shared/models/data-entry-form.model';
import Sweetalert from 'sweetalert2';
import { Component, ViewChild, OnInit, Input, EventEmitter, Output } from '@angular/core';
import * as XLSX from 'ts-xlsx';
import { Router } from '@angular/router';
import { DateFieldPopupComponent } from './date-field-popup/date-field-popup.component';
import { CustomFormViewModel } from './custom-form.view-model';
import { camelCase } from 'change-case';

const addDataEntryMutation = require('graphql-tag/loader!../../shared/graphql/add-data-entry.gql');
const updateDataEntryMutation = require('graphql-tag/loader!../../shared/graphql/update-data-entry.gql');
const dataSourceByNameQuery = require('graphql-tag/loader!../../shared/graphql/data-source-by-name.query.gql');
const allUserQuery = require('graphql-tag/loader!../../shared/graphql/get-all-users.gql');
const processImportFileQuery = require('graphql-tag/loader!../../shared/graphql/process-import-file.gql');

@Component({
  selector: 'kpi-import-file',
  templateUrl: './import-file.component.pug',
  styleUrls: ['./import-file.component.scss'],
  providers: [CustomFormViewModel],
})
export class ImportFileComponent implements OnInit {
  @ViewChild(DateFieldPopupComponent) dateFieldPopupComponent: DateFieldPopupComponent;
  @Input() dataEntry: DataEntryList;
  @Output() closeUploadFile = new EventEmitter();

  // csv
  csvImagePath: string;
  csvFileData = {
    inputName: undefined,
    fields: [],
    records: [],
    dateRangeField: undefined,
    filePath: ''
  };

  file: any;

  // excel
  excelImagePath: string;
  excelFileData = {
    inputName: undefined,
    fields: [],
    records: [],
    dateRangeField: undefined,
    filePath: ''
  };

  usersList: [{
    _id: string;
    fullName: string;
    pictureUrl: string
    selected: boolean;
  }];

  currentUser: IUserInfo;

  constructor(
    public vm: CustomFormViewModel,
    private _apolloService: ApolloService,
    private _router: Router,
    private _userService: UserService
  ) {
    this.excelImagePath = '../../../assets/img/datasources/CustomExcel.DataSource.MainImage.png';
    this.csvImagePath = '../../../assets/img/datasources/csv.png';
  }

  ngOnInit() {
    this._getCurrentUser();
    this._getAllUsers();
  }

  private _getCurrentUser() {
    this._userService.user$
      .distinctUntilChanged()
      .subscribe((user: IUserInfo) => {
          this.currentUser = user;
      });
  }

  private _getAllUsers() {
      this._apolloService.networkQuery(allUserQuery).then(res => {
        this.usersList = res.allUsers.map(u => {
          if (this.dataEntry) {
            const dataEntryUser = this.dataEntry.users.find(f => f === u._id);
            return {
              _id: u._id,
              fullName: u.profile.firstName + ' ' + u.profile.lastName,
              pictureUrl: u.profilePictureUrl,
              selected: dataEntryUser ? true : false
            };
          } else {
            return {
              _id: u._id,
              fullName: u.profile.firstName + ' ' + u.profile.lastName,
              pictureUrl: u.profilePictureUrl,
              selected: this.currentUser._id === u._id ? true : false
            };
          }
        });
        // if (this.dataEntry) {
        //   const fileType = this.dataEntry.description.includes('.csv') ? 'csv' : 'xls';
        //   switch (fileType) {
        //     case 'csv':
        //       this.csvFileData.inputName = this.dataEntry.description + '.' + fileType;
        //       this.csvFileData.fields = this.dataEntry..fields;
        //       break;
        //     case 'xls':
        //       this.excelFileData.inputName = this.dataEntry.description + '.' + fileType;
        //       this.excelFileData.fields = this.dataEntry.fields;
        //       break;
        //   }
        // }
      });
  }

  save() {
    const filesData: ICustomData[] = [];
    const selectedUsers = this.usersList.filter(f => f.selected).map(u => {
      return u._id;
    });

    if (this.csvFileData.inputName) {
      filesData.push({
        inputName: this.csvFileData.inputName,
        fields: JSON.stringify(this.csvFileData.fields),
        records: JSON.stringify(this.csvFileData.records),
        dateRangeField: this.csvFileData.dateRangeField,
        users: selectedUsers
      });
    }
    if (this.excelFileData.inputName) {
      filesData.push({
        inputName: this.excelFileData.inputName,
        fields: JSON.stringify(this.excelFileData.fields),
        records: JSON.stringify(this.excelFileData.records),
        dateRangeField: this.excelFileData.dateRangeField,
        users: selectedUsers
      });
    }

    const mutation = !this.dataEntry ? addDataEntryMutation : updateDataEntryMutation;

    filesData.map(file => {
      const inputData = !this.dataEntry ? file : JSON.stringify(file);
      this._apolloService.mutation < ICustomData > (mutation, { input: inputData }, ['ServerSideConnectors', 'DataEntries'])
      .then(() => {
        if (this.dataEntry) {
          this.closeUploadFile.emit();
        } else {
          this._router.navigateByUrl('/data-entry/show-all');
        }
      })
      .catch(err => console.log('Server errors: ' + JSON.stringify(err)));
    });
  }

  cancel() {
    this.csvFileData.inputName = undefined;
    this.excelFileData.inputName = undefined;
    if (this.dataEntry) {
      this.closeUploadFile.emit();
    } else {
      this._router.navigateByUrl('/data-entry/show-all');
    }
}

  isFormValid() {
    const selectedUsers = this.usersList ? this.usersList.filter(u => u.selected === true) : [];
    return !this.noFileImported && selectedUsers.length ? true : false;
  }

  get noFileImported() {
    return this.csvFileData.inputName || this.excelFileData.inputName ? false : true;
  }

  dropImportedFile(fileType: string) {
    switch (fileType) {
      case 'csv':
        this._csvFileReset();
        break;
      case 'excel':
        this._excelFileReset();
        break;
    }
  }

  importFile(event) {
    const target = event.target || event.srcElement;
    this.file = target.files[0];
    if (!this.isCSVFile(this.file) && !this.isXLSFile(this.file)) {
      return Sweetalert({
        title: 'Invalid file!',
        text: 'Please, import valid .csv or .xlsx file.',
        type: 'error',
        showConfirmButton: true,
        confirmButtonText: 'Ok'
      });
    }

    const fileExtensionIndex = this.file.name.lastIndexOf('.') !== -1 ? this.file.name.lastIndexOf('.') : this.file.name.length - 1;
    const fileName = this.file.name.substr(0, fileExtensionIndex);

    this._apolloService.networkQuery(dataSourceByNameQuery, { name: camelCase(fileName).toLowerCase() })
      .then(res => {
        if (res.dataSourceByName) {
          return Sweetalert({
            title: 'File exists!',
            text: 'The file you are trying to import already exists. Please select another one.',
            type: 'error',
            showConfirmButton: true,
            confirmButtonText: 'Ok'
          });
        }

      if (this.dataEntry) {
        this._csvFileReset();
        this._excelFileReset();
      }

      if (this.isCSVFile(this.file)) {
        this._processCsvFile(this.file);
      }

        if (this.isXLSFile(this.file)) {
          this._processExcelFile(this.file);
        }
      })
      .catch(err => console.log(err));
  }

  isCSVFile(file) {
    return file.name.endsWith('.csv');
  }

  isXLSFile(file) {
    return file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
  }

  private _processCsvFile(file) {
    this._csvFileReset();

    const reader = new FileReader();
    reader.onload = () => {
      const csvData = <any>reader.result;
      const csvRecordsArray = JSON.stringify(csvData.split(/\r\n|\n/));

      this._apolloService.networkQuery(processImportFileQuery, { fileData: csvRecordsArray, fileType: 'csv' }).then(res => {
        const result = JSON.parse(res.processImportFile);
        this.csvFileData.fields = result.fields;
        this.csvFileData.records = result.records;

        if (!this.vm.isRequiredDataTypePresent(this.csvFileData.fields)) {
          this._csvFileReset();

          return Sweetalert({
            title: 'Invalid file!',
            text: 'The file you are trying to import do not have the necessary data type.',
            type: 'error',
            showConfirmButton: true,
            confirmButtonText: 'Ok'
          });
        }

        const headerLength = this.csvFileData.fields.length;
        for (let i = 0; i < this.csvFileData.records.length; i++) {
          const data = this.csvFileData.records[i];
          if (data.length !== headerLength) {
            if (csvRecordsArray[i] === '') {
                Sweetalert({
                title: 'Invalid file',
                text: 'Extra blank line is present at line number  ' + i + ', please remove it.',
                type: 'error',
                showConfirmButton: true,
                confirmButtonText: 'Ok'
                });
                this._csvFileReset();
                return;
            } else {
                Sweetalert({
                title: 'Invalid file',
                text: 'Record at line number ' + i + ' contain ' + data.length + ' tokens, ' +
                'and is not matching with header length of ' + headerLength,
                type: 'error',
                showConfirmButton: true,
                confirmButtonText: 'Ok'
                });
                this._csvFileReset();
                return;
            }
          }
        }

        this.csvFileData.inputName = file.name;

        if (this.csvFileData.records === null) {
          this._csvFileReset();
        } else {
          this._verifyDateFields(this.csvFileData.fields);
        }
      });
    };

    reader.readAsText(file);

    reader.onerror = function () {
      alert('Unable to read ' + file);
    };
  }

  private _processExcelFile(file) {
      this._excelFileReset();

      const fileReader = new FileReader();
      fileReader.onload = () => {
          const arrayBuffer = fileReader.result;
          const data = new Uint8Array(<any>arrayBuffer);
          const arr = new Array();
          for (let i = 0; i !== data.length; ++i) {
            arr[i] = String.fromCharCode(data[i]);
          }
          const bstr = arr.join('');
          const workbook = XLSX.read(bstr, {type: 'binary'});
          const first_sheet_name = workbook.SheetNames[0];
          const worksheet = JSON.stringify(workbook.Sheets[first_sheet_name]);

          this._apolloService.networkQuery(processImportFileQuery, { fileData: worksheet, fileType: 'excel' }).then(res => {
            const result = JSON.parse(res.processImportFile);
            this.excelFileData.fields = result.fields;
            this.excelFileData.records = result.records;

            if (!this.vm.isRequiredDataTypePresent(this.excelFileData.fields)) {
              this._excelFileReset();

              return Sweetalert({
                title: 'Invalid file!',
                text: 'The file you are trying to import do not have the necessary data type.',
                type: 'error',
                showConfirmButton: true,
                confirmButtonText: 'Ok'
              });
            } else {
              this._verifyDateFields(this.excelFileData.fields);
            }
          });
      };
      fileReader.readAsArrayBuffer(file);
      this.excelFileData.inputName = file.name;
  }

  private _csvFileReset() {
    this.csvFileData.inputName = undefined;
    this.csvFileData.fields = [];
    this.csvFileData.records = [];
  }

  private _excelFileReset() {
    this.excelFileData.inputName = undefined;
    this.excelFileData.fields = [];
    this.excelFileData.records = [];
  }

  private _verifyDateFields(fields) {
    this.vm.dateFields = [];
    fields.map(field => {
      if (field.dataType === 'Date') {
        this.vm.dateFields.push({
          id: field.columnName,
          title: field.columnName.toUpperCase()
        });
      }
    });

    if (this.vm.dateFields.length > 1) {
      this.dateFieldPopupComponent.open();
    } else {
      this._updateDateField(this.vm.dateFields[0].id);
    }
  }

  closeModal() {
    this.dateFieldPopupComponent.close();
    this._updateDateField(this.vm.dateRangeField);
  }

  private _updateDateField(dateFieldName) {
    const fileType = this.isCSVFile(this.file) ? 'csv' : 'xls';
    const selectedDateFieldIndex = fileType === 'csv' ?
      this.csvFileData.fields.findIndex(f => f.columnName === dateFieldName) :
      this.excelFileData.fields.findIndex(f => f.columnName === dateFieldName);
    if (fileType === 'csv') {
      this.csvFileData.dateRangeField = this.csvFileData.fields[selectedDateFieldIndex].columnName;
    } else {
      this.excelFileData.dateRangeField = this.excelFileData.fields[selectedDateFieldIndex].columnName;
    }
  }

  updateUserSelection(selected, index) {
    this.usersList[index].selected = selected;
  }

}

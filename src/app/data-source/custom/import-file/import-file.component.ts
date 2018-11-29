import { ApolloService } from '../../../shared/services/apollo.service';
import { CustomFormViewModel } from '../custom-datasource.viewmodel';
import { ICustomData, ICustomSchemaInfo } from '../../shared/models/data-sources/custom-form.model';
import Sweetalert from 'sweetalert2';
import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { DialogResult } from '../../../shared/models/dialog-result';
import * as XLSX from 'ts-xlsx';
import { Router } from '@angular/router';
import { DateFieldPopupComponent } from './date-field-popup/date-field-popup.component';

const addCustomMutation = require('graphql-tag/loader!../custom-datasource.connect.gql');
const dataSourceByNameQuery = require('graphql-tag/loader!../data-source-by-name.query.gql');

@Component({
  selector: 'kpi-import-file',
  templateUrl: './import-file.component.pug',
  styleUrls: ['./import-file.component.scss']
})
export class ImportFileComponent {
  @Output() dialogResult = new EventEmitter<DialogResult>();
  @ViewChild(DateFieldPopupComponent) dateFieldPopupComponent: DateFieldPopupComponent;

  // csv
  csvImagePath: string;
  csvFileData = {
    inputName: undefined,
    fields: [],
    records: [],
    dateRangeField: undefined
  };

  csvTokenDelimeter = ',';
  file: any;

  // excel
  excelImagePath: string;
  excelFileData = {
    inputName: undefined,
    fields: [],
    records: [],
    dateRangeField: undefined
  };

  constructor(
    private vm: CustomFormViewModel,
    private _apolloService: ApolloService,
    private _router: Router
  ) {
    this.excelImagePath = '../../../assets/img/datasources/CustomExcel.DataSource.MainImage.png';
    this.csvImagePath = '../../../assets/img/datasources/csv.png';
  }

  connect() {
    const filesData: ICustomData[] = [];

    if (this.csvFileData.inputName) {
      filesData.push({
        inputName: this.csvFileData.inputName,
        fields: JSON.stringify(this.csvFileData.fields),
        records: JSON.stringify(this.csvFileData.records),
        dateRangeField: this.csvFileData.dateRangeField
      });
    }
    if (this.excelFileData.inputName) {
      filesData.push({
        inputName: this.excelFileData.inputName,
        fields: JSON.stringify(this.excelFileData.fields),
        records: JSON.stringify(this.excelFileData.records),
        dateRangeField: this.excelFileData.dateRangeField
      });
    }

    filesData.map(file => {
      this._apolloService.mutation < ICustomData > (addCustomMutation, { input: file }, ['ServerSideConnectors'])
      .then(this._router.navigateByUrl('/datasource/listConnectedDataSourcesComponent'))
      .catch(err => console.log('Server errors: ' + JSON.stringify(err)));
    });
  }

  cancel() {
    this.csvFileData.inputName = undefined;
    this.excelFileData.inputName = undefined;
    this.dialogResult.emit(DialogResult.CANCEL);
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

    let fileName = this.file.name;
    this.vm.fileExtensions.map(f => {
      fileName = fileName.replace(f, '');
    });

    this._apolloService.networkQuery(dataSourceByNameQuery, { name: fileName })
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
    return file.name.endsWith('.xlsx') ||  file.name.endsWith('.xls');
  }

  private _processCsvFile(file) {
    this._csvFileReset();

    const reader = new FileReader();
    reader.onload = () => {
      const csvData = <any>reader.result;
      const csvRecordsArray = csvData.split(/\r\n|\n/);

      const headerLength = this._getCsvHeaderArray(csvRecordsArray, ',').length;

      this.csvFileData.records = this._getDataRecordsArrayFromCSVFile(csvRecordsArray,
        headerLength, this.csvTokenDelimeter);

      if (this.csvFileData.records.length === 0) {
        return;
      }

      this.csvFileData.fields = this._getFieldsArrayFromCSVFile(csvRecordsArray, this.csvTokenDelimeter);

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

      this.csvFileData.inputName = file.name;

      if (this.csvFileData.records === null) {
        this._csvFileReset();
      } else {
        this._verifyDateFields(this.csvFileData.fields);
      }
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
          const worksheet = workbook.Sheets[first_sheet_name];
          const alphExtended = this.vm.getAlphabetExtended();

          let j = 1;
          for (let i = 1; i <= 2000; i++) {
            const dataArray = [];
            alphExtended.map(alph => {
              const cell = alph + i;
              let cellValue = '';
              if (worksheet[cell]) {
                cellValue = <any>worksheet[cell].w.trimEnd();
              }

              if (j === 1) {
                if (cellValue !== '') {
                  const newfield: ICustomSchemaInfo = {
                    columnName: cellValue,
                    dataType: ''
                  };

                  this.excelFileData.fields.push(newfield);
                }
              } else if (dataArray.length < this.excelFileData.fields.length) {
                dataArray.push(cellValue);
              }
            });

            const dataArrayValueNotNull = dataArray.filter(d => d !== '');
            if (dataArray.length > 0 && dataArrayValueNotNull.length > 0) {
              this.excelFileData.records.push(dataArray);
            }

            j += 1;
          }

          if (this.excelFileData.records.length > 0) {
            for (let n = 0; n < this.excelFileData.records[0].length; n++) {
              const element = this.excelFileData.records[0][n];
              const cellDataType = this.vm.getDataTypeFromValue(element);
              this.excelFileData.fields[n].dataType = cellDataType;
            }
          }

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
      };
      fileReader.readAsArrayBuffer(file);
      this.excelFileData.inputName = file.name;
  }

  private _getCsvHeaderArray(csvRecordsArr, tokenDelimeter) {
    const headers = csvRecordsArr[0].split(tokenDelimeter);
    const headerArray = [];
    for (let j = 0; j < headers.length; j++) {
        headerArray.push(headers[j]);
    }
    return headerArray;
  }

  private _getFieldsArrayFromCSVFile(csvRecordsArray, tokenDelimeter) {
    const fieldsArray = csvRecordsArray[0].split(tokenDelimeter);
    const fields: ICustomSchemaInfo[] = [];
    for (let i = 0; i < fieldsArray.length; i++) {
      const element = fieldsArray[i];
      const dataType = this.vm.getDataTypeFromValue(this.csvFileData.records[0][i]);
      fields.push({
        columnName: element,
        dataType: dataType
      });
    }
    return fields;
  }

  private _getDataRecordsArrayFromCSVFile(csvRecordsArray, headerLength, tokenDelimeter) {
    const dataArr = [];

    for (let i = 1; i < csvRecordsArray.length; i++) {
        const dataRow = csvRecordsArray[i].split(tokenDelimeter);

        const data = [];
        let compositeField = '';
        let concatData = false;
        for (let j = 0; j < dataRow.length; j++) {
          const value = dataRow[j];
          if (value.startsWith('"') && value.endsWith('"')) {
            data.push(value.replace(/"/g, ''));
          } else if (value.startsWith('"')) {
            compositeField = value;
            concatData = true;
          } else if (value.endsWith('"')) {
            compositeField += ',' + value;
            concatData = false;
            data.push(compositeField.replace(/"/g, ''));
          } else if (concatData) {
            compositeField += ',' + value;
          } else {
            data.push(value);
          }
        }

        if (data.length !== headerLength) {
            if (csvRecordsArray[i] === '') {
              Sweetalert({
                title: 'Invalid file',
                text: 'Extra blank line is present at line number  ' + i + ', please remove it.',
                type: 'error',
                showConfirmButton: true,
                confirmButtonText: 'Ok'
              });
              return [];
            } else {
              Sweetalert({
                title: 'Invalid file',
                text: 'Record at line number ' + i + ' contain ' + data.length + ' tokens, ' +
                'and is not matching with header length of ' + headerLength,
                type: 'error',
                showConfirmButton: true,
                confirmButtonText: 'Ok'
              });
              return [];
            }
        }
        dataArr.push(data);
    }
    return dataArr;
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

}

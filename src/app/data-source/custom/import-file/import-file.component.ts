import { ApolloService } from '../../../shared/services/apollo.service';
import { CustomFormViewModel } from '../custom-datasource.viewmodel';
import { ICustomData, ICustomSchemaInfo } from '../../shared/models/data-sources/custom-form.model';
import Sweetalert from 'sweetalert2';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DialogResult } from '../../../shared/models/dialog-result';
import * as XLSX from 'ts-xlsx';
import { Router } from '@angular/router';

const addCustomMutation = require('graphql-tag/loader!../custom-datasource.connect.gql');

@Component({
  selector: 'kpi-import-file',
  templateUrl: './import-file.component.pug',
  styleUrls: ['./import-file.component.scss']
})
export class ImportFileComponent {
  @Output() dialogResult = new EventEmitter<DialogResult>();

  // csv
  csvImagePath: string;
  csvFileData = {
    inputName: undefined,
    fields: [],
    records: []

  };
  csvTokenDelimeter = ',';

  // excel
  excelImagePath: string;
  excelFileData = {
    inputName: undefined,
    fields: [],
    records: []
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
        fields: this.csvFileData.fields,
        records: JSON.stringify(this.csvFileData.records)
      });
    }
    if (this.excelFileData.inputName) {
      filesData.push({
        inputName: this.excelFileData.inputName,
        fields: this.excelFileData.fields,
        records: JSON.stringify(this.excelFileData.records)
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
    const file = target.files[0];
    if (!this.isCSVFile(file) && !this.isXLSFile(file)) {
      return Sweetalert({
        title: 'Invalid file!',
        text: 'Please, import valid .csv or .xlsx file.',
        type: 'error',
        showConfirmButton: true,
        confirmButtonText: 'Ok'
      });
    }

    if (this.isCSVFile(file)) {
      this._processCsvFile(file);
    }

    if (this.isXLSFile(file)) {
      this._processExcelFile(file);
    }

  }

  isCSVFile(file) {
    return file.name.endsWith('.csv');
  }

  isXLSFile(file) {
    return file.name.endsWith('.xlsx') ||  file.name.endsWith('.xls');
  }

  private _processCsvFile(file) {
    const reader = new FileReader();

    reader.onload = (data) => {
      const csvData = reader.result;
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
      }
    };

    reader.readAsText(file);

    reader.onerror = function () {
      alert('Unable to read ' + file);
    };
  }

  private _processExcelFile(file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
          const arrayBuffer = fileReader.result;
          const data = new Uint8Array(arrayBuffer);
          const arr = new Array();
          for (let i = 0; i !== data.length; ++i) {
            arr[i] = String.fromCharCode(data[i]);
          }
          const bstr = arr.join('');
          const workbook = XLSX.read(bstr, {type: 'binary'});
          const first_sheet_name = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[first_sheet_name];

          let j = 1;
          for (let i = 1; i <= 1000; i++) {
            const dataArray = [];
            this.vm.Alphabet.map(alph => {
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
      fields.push({
        columnName: element,
        dataType: this.vm.getDataTypeFromValue(this.csvFileData.records[0][i])
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

}

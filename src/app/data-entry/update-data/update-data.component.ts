import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import * as XLSX from 'ts-xlsx';
import Sweetalert from 'sweetalert2';
import { ApolloService } from 'src/app/shared/services/apollo.service';
import { ICustomData } from 'src/app/data-source/shared/models/data-sources/custom-form.model';
import { IDataEntrySource } from '../shared/models/data-entry.models';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalComponent } from 'src/app/ng-material-components';

const processImportFileQuery = require('graphql-tag/loader!../shared/graphql/process-import-file.gql');
const updateDataFormFileMutation = require('graphql-tag/loader!../shared/graphql/update-data-from-file.gql');

@Component({
  selector: 'kpi-update-data',
  templateUrl: './update-data.component.pug',
  styleUrls: ['./update-data.component.scss']
})
export class UpdateDataComponent implements OnInit {
  @Input() virtualSource: IDataEntrySource;
  @ViewChild('updateData') updateDataModal: ModalComponent;

  fg: FormGroup;
  excelImagePath: string;
  csvImagePath: string;
  readyToSave = false;
  showSpinner = false;

  file: any;
  private InputFileData: { fields: any; records: any; overRide: boolean; } = 
  {
    fields: null,
    records: null,
    overRide: false
  };

  constructor(private _apolloService: ApolloService) {}

  ngOnInit() {
    this.fg = new FormGroup({
      overRide: new FormControl()
    })

    this.excelImagePath = '../../assets/img/datasources/CustomExcel.DataSource.MainImage.png';
    this.csvImagePath = '../../assets/img/datasources/csv.png';
  }

  openModal(){
    this.updateDataModal.open();
  }

  showCsvPic(): boolean{
    let val = !this.file || (this.file && this.isCSVFile());
    return val;
  }

  showXLSXPic():boolean{
    let val = !this.file || (this.file && this.isXLSFile());
    return val;
  }

  isCSVFile(): boolean {
    return this.file && this.file.name.endsWith('.csv');
  }

  isXLSFile() : boolean {
    return this.file && 
    (this.file.name.endsWith('.xlsx') 
    || this.file.name.endsWith('.xls'))
  }

  updateFile(event: { target: any; srcElement: any; }){
    const target = event.target || event.srcElement;
    this.file = target.files[0];

    if (!this.isCSVFile() && !this.isXLSFile()) {
      this.resetComponentVariables();

      return Sweetalert({
        title: 'Invalid file!',
        text: 'Please, import valid .csv or .xlsx file.',
        type: 'error',
        showConfirmButton: true,
        confirmButtonText: 'Ok'
      });
    }

    if(this.isXLSFile()){
      this._processExcelData(this.file);
    }
    
    if(this.isCSVFile()){
      this._processCsvData(this.file);
    }
  }
 
  private _processExcelData(uploadedFile){
    let reader = new FileReader();
    reader.onload = () => {
        const arrayBuffer = reader.result;
        const data = new Uint8Array(<any>arrayBuffer);
        const arr = new Array();
        for (let i = 0; i !== data.length; ++i) {
          arr[i] = String.fromCharCode(data[i]);
        }
        const bstr = arr.join('');
        const workbook = XLSX.read(bstr, {type: 'binary'});
        const first_sheet_name = workbook.SheetNames[0];
        const worksheet = JSON.stringify(workbook.Sheets[first_sheet_name]);

        this._apolloService.networkQuery(processImportFileQuery, { fileData: worksheet, fileType: 'excel' })
        .then((res: { processImportFile: string; }) => {

          const result = JSON.parse(res.processImportFile);
          this.InputFileData.fields = result.fields;
          this.InputFileData.records = result.records;

          this.InputFileData.overRide = this.fg.value.overRide;
          
          if(this.fileContainsAllRequiredFields()){

          //- data ready to save
          this.readyToSave = true;

          }
          else{
          this.invalidFileFlow()
          }

        });
    };

    reader.readAsArrayBuffer(uploadedFile);
    
    reader.onerror = function (err) {
      console.log('Error reading file:  -->' + err);
    };
  }

  private _processCsvData(file) {

    let reader = new FileReader();
    reader.onload = () => {
      const csvData = <any>reader.result;
      const csvRecordsArray = JSON.stringify(csvData.split(/\r\n|\n/));

      this._apolloService.networkQuery(processImportFileQuery, { fileData: csvRecordsArray, fileType: 'csv' })
      .then(res => {
        const result = JSON.parse(res.processImportFile);
        this.InputFileData.fields = result.fields;
        this.InputFileData.records = result.records;
        this.InputFileData.overRide = this.fg.value.overRide;

        if(this.fileContainsAllRequiredFields()){
            const headerLength = this.InputFileData.fields.length;
            
            //- process records for accuracy 
            for (let i = 0; i < this.InputFileData.records.length; i++) {
              const data = this.InputFileData.records[i];
              if (data.length !== headerLength) {
                this.readyToSave = false;

                if (csvRecordsArray[i] === '') {
                    this.updateDataModal.close();
                    return  Sweetalert({
                      title: 'Invalid file',
                      text: 'Extra blank line is present at line number  ' + (i + 2) + ', please remove it.',
                      type: 'error',
                      showConfirmButton: true,
                      confirmButtonText: 'Ok'
                      });

                } else {
                    this.updateDataModal.close();
                    return Sweetalert({
                      title: 'Invalid file',
                      text: 'Record at line number ' + (i + 2) + ' contain ' + data.length + ' tokens, ' +
                      'and is not matching with header length of ' + headerLength,
                      type: 'error',
                      showConfirmButton: true,
                      confirmButtonText: 'Ok'
                      });
                }
              }
            } //- end of for checking records length

            //- data should be clean here and ready for backend
            this.readyToSave = true;
      }
      //- file doesnt have all required fields
      else{
        this.invalidFileFlow();
      }
      });
    };

    reader.readAsText(file);

    reader.onerror = function () {
      console.log('Unable to read scv file' + file);
    };
  }

  fileContainsAllRequiredFields(): boolean{
    const vsFields = this.virtualSource.fields;
    const fileFields = this.InputFileData.fields;

    const requiredFields = vsFields.filter(f => {
      if(f.path === this.virtualSource.dateField){
        return true;
      }
      return f.required;
    })

    const reqFieldsNames = requiredFields.map(f => f.name)
    const fileFieldsNames = fileFields.map(f => f.columnName)
    
    const allReqFieldsIncluded = reqFieldsNames.every(val => fileFieldsNames.includes(val));

    return allReqFieldsIncluded;  
  }

  save(){
    this.showSpinner = true;

    this._apolloService.mutation<any>(updateDataFormFileMutation, 
      {vSId: this.virtualSource._id , input: JSON.stringify(this.InputFileData) })
    .then((res: any) => {
      this.updateDataModal.close();
      if(res.data.updateDataFromFile.success){       
        this.updateDataModal.close();
        this.resetComponentVariables();
        this.showSpinner = false;

        setTimeout(() => {
          return Sweetalert({
            type: 'success',
            title: 'Your data has been updated successfully',
            showConfirmButton: false,
            timer: 1500
        });
        }, 900);
        
      }
      console.log(res)
    })
    .catch((err: any) => console.log('Server errors: ' + JSON.stringify(err)));
  }

  resetComponentVariables(){
    this.readyToSave = false;
    this.file = undefined;
    
    this.InputFileData = {
      fields: null,
      records: null,
      overRide: true
    }
  }

  invalidFileFlow(){
    this.updateDataModal.close();
    this.resetComponentVariables();

    return Sweetalert({
      title: 'Invalid file!',
      text: 'The file you are trying to import does not contains all required fields',
      type: 'error',
      showConfirmButton: true,
      confirmButtonText: 'Ok'
    })
  }

  }
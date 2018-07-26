import { Router } from '@angular/router';
import { ApolloService } from './../../../shared/services/apollo.service';
import { ICustomData } from './../../shared/models/data-sources/custom-form.model';
import { CustomFormViewModel } from './../custom.viewmodel';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DialogResult } from '../../../shared/models/dialog-result';
import { FormArray, FormGroup, FormControl } from '../../../../../node_modules/@angular/forms';

const addCustomMutation = require('graphql-tag/loader!../custom.connect.gql');

@Component({
  selector: 'kpi-data-manually',
  templateUrl: './data-manually.component.pug',
  styleUrls: ['./data-manually.component.scss']
})
export class DataManuallyComponent implements OnInit {
  @Output() dialogResult = new EventEmitter<DialogResult>();

  currentStep = 1;
  blankTablePath: string;
  tablePath: string;

  constructor(
    public vm: CustomFormViewModel,
    private _apolloService: ApolloService,
    private _router: Router
  ) {
    this.blankTablePath = '../../../../assets/img/datasources/blank_table.png';
    this.tablePath = '../../../../assets/img/datasources/table.png';
  }

  ngOnInit() {
  }

  selectTableType(tableOption) {
    this.vm.setSelectedTableOption(tableOption);
    if (tableOption === 'blank_table') {
      this.vm.initialize(this.vm.getDefaultInputSchema());
    } else {
      this.vm.initialize(this.vm.getDefaultSchema());
    }
    this.goNext();
  }

  goBack() {
    if (this.currentStep === 3 && this.vm.getSelectedTableOption() === 'table') {
      this.currentStep -= 2;
    } else {
      this.currentStep -= 1;
    }
  }

  goNext() {
    if (this.currentStep === 1 && this.vm.getSelectedTableOption() === 'table') {
      this.currentStep += 2;
    } else {
      this.currentStep += 1;
    }
  }

  connect() {
    const tableFields = [];
    const tableRecords = [];

    const schemaFormGroup = <any>this.vm.fg.get('schema') as FormArray;
    schemaFormGroup.controls.map(s => {
      const schema = <any>s;
      tableFields.push(schema.value);
    });

    const dataFormGroup = this.vm.fg.get('data') as FormArray;
    dataFormGroup.controls.map(d => {
      const controlGroup = <any>d;
      const data = [];
      controlGroup.controls.map(c => {
        if (c.value !== null && c.value !== '') {
          data.push(c.value);
        }
      });

      if (data.length === schemaFormGroup.length) {
        tableRecords.push(data);
      }

    });

    const tableData: ICustomData = {
      inputName: 'test',
      fields: tableFields,
      records: JSON.stringify(tableRecords)
    };

    this._apolloService.mutation < ICustomData > (addCustomMutation, { input: tableData }, ['ServerSideConnectors'])
    .then(this._router.navigateByUrl('/datasource/listConnectedDataSourcesComponent'))
    .catch(err => console.log('Server errors: ' + JSON.stringify(err)));
  }

  isValidForm(): boolean {
    let returnValue = true;
    returnValue = this.vm.fg.valid;

    const schema = this.vm.fg.controls['schema'].value;

    switch (this.currentStep) {
      case 2:

        if (schema.length < 3) {
          returnValue = false;
        }
        schema.map(s => {
          if (s.columnName === '' || s.columnName === undefined) {
            returnValue = false;
          }
        });

        if (!this.vm.isRequiredDataTypePresent(schema)) {
          returnValue = false;
        }
        break;
      case 3:
        const data = <FormArray>this.vm.fg.controls['data'];
        const totalData = data.controls.length;

        const isEmptyValueArray: boolean[] = [];
        for (let i = 0; i < totalData; i++) {
          const controls = data.controls[i];
          let isRowEmptyValue = false;
          for (let j = 0; j < schema.length; j++) {
            if (controls.value[j] === null || controls.value[j] === '') {
              isRowEmptyValue = true;
            }
          }
          isEmptyValueArray[i] = isRowEmptyValue;
        }

        let isEmptyValue = false;
        for (let row = 0; row < isEmptyValueArray.length; row++) {
          if (isEmptyValueArray[row] === true) {
            isEmptyValue = true;
          }
        }
        if (!isEmptyValue) {
          data.push(new FormGroup(
            schema.map(() => {
              return new FormControl();
            })
          ));
        }
        returnValue = true;
        break;
    }
    return returnValue;
  }

  cancel() {
    if (this.vm.fg) {
      this.vm.fg.reset();
    }
    this.currentStep = 1;
    this.dialogResult.emit(DialogResult.CANCEL);
  }

}

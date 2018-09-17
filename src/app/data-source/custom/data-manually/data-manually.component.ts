import { Router } from '@angular/router';
import { ApolloService } from '../../../shared/services/apollo.service';
import { ICustomData } from '../../shared/models/data-sources/custom-form.model';
import { CustomFormViewModel } from '../custom-datasource.viewmodel';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DialogResult } from '../../../shared/models/dialog-result';
import { FormArray, FormGroup, FormControl } from '@angular/forms';

const addCustomMutation = require('graphql-tag/loader!../custom-datasource.connect.gql');

@Component({
  selector: 'kpi-data-manually',
  templateUrl: './data-manually.component.pug',
  styleUrls: ['./data-manually.component.scss']
})
export class DataManuallyComponent implements OnInit {
  @Output() dialogResult = new EventEmitter<DialogResult>();

  blankTablePath: string;
  tablePath: string;
  isEditing: boolean;

  constructor(
    public vm: CustomFormViewModel,
    private _apolloService: ApolloService,
    private _router: Router
  ) {
    this.blankTablePath = '../../../../assets/img/datasources/blank_table.png';
    this.tablePath = '../../../../assets/img/datasources/table.png';
  }

  ngOnInit() {
      this.vm.isEdit$.subscribe(v => this.isEditing = v);
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
    let currentStep = this.vm.currentStep;
    if (currentStep === 3 && this.vm.getSelectedTableOption() === 'table') {
      this.vm.updateCurrentStep(currentStep -= 2);
    } else {
      this.vm.updateCurrentStep(currentStep -= 1);
    }
  }

  goNext() {
    let currentStep = this.vm.currentStep;
    if (currentStep === 1 && this.vm.getSelectedTableOption() === 'table') {
      this.vm.updateCurrentStep(currentStep += 2);
    } else {
      this.vm.updateCurrentStep(currentStep += 1);
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
        data.push(c.value);
      });

      tableRecords.push(data);
    });

    const tableData: ICustomData = {
      inputName: this.vm.fg.controls['dataName'].value,
      fields: tableFields,
      records: JSON.stringify(tableRecords)
    };

    this._apolloService.mutation < ICustomData > (addCustomMutation, { input: tableData }, ['ServerSideConnectors'])
      .then(res => {
        this._resetFormGroupData();
        this.dialogResult.emit(DialogResult.CANCEL);
        this._router.navigateByUrl('/datasource/listConnectedDataSourcesComponent');
      })
      .catch(err => console.log('Server errors: ' + JSON.stringify(err)));
  }

  isValidForm(): boolean {
    let returnValue = true;
    if (!this.vm.fg.valid) {
      return false;
    }

    const schema = this.vm.fg.controls['schema'].value;

    switch (this.vm.currentStep) {
      case 2:
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
        const dataName = this.vm.fg.controls['dataName'].value;
        if (dataName === null || dataName === '') {
          returnValue = false;
        }
        break;
    }
    return returnValue;
  }

  cancel() {
    this._resetFormGroupData();
    this.dialogResult.emit(DialogResult.CANCEL);
  }

  private _resetFormGroupData() {
    if (this.vm.fg) {
      this.vm.fg.get('data').reset();
    }
    this.vm.updateIsEdit(false);
  }

}

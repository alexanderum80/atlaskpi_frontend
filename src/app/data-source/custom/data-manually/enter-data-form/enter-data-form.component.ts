import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { CustomFormViewModel } from './../../custom.viewmodel';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'kpi-enter-data-form',
  templateUrl: './enter-data-form.component.pug',
  styleUrls: ['./enter-data-form.component.scss']
})
export class EnterDataFormComponent implements OnInit {
  @Input() dataField: FormArray;

  headerData: string[] = [];
  bodyData: string[] = [];
  fullScreen = false;

  constructor(
    private vm: CustomFormViewModel
  ) { }

  ngOnInit() {
    const schema = this.vm.fg.controls['schema'].value;
    this._setHeaderData(schema);
    this._setBodyData(schema);
    this._subscribeToFormChanges();
  }

  private _setHeaderData(schema) {
    schema.map(s => {
      this.headerData.push(s.columnName);
    });
  }

  private _setBodyData(schema) {
    const dataFormGroup = this.vm.fg.get('data') as FormArray;
    if (dataFormGroup.controls.length === 0) {
      this._addNewRow();
    }
  }

  private _addNewRow() {
    const dataFormGroup = this.vm.fg.get('data') as FormArray;
    const schema = this.vm.fg.controls['schema'].value;

    dataFormGroup.push(new FormGroup(
    schema.map(() => {
        return new FormControl();
      })
    ));
  }

  private _subscribeToFormChanges() {
    const schemaFormGroup = <any>this.vm.fg.controls['schema'];
    const dataFormGroup = this.vm.fg.get('data') as FormArray;
    const totalFields = schemaFormGroup.controls.length;
    dataFormGroup.controls.map(d => {
      const controls = <any>d;
      for (let i = 0; i < totalFields; i++) {
        controls.controls[i].valueChanges.subscribe(controlValue => {
          if (controlValue !== null && controlValue !== '') {
            if (this.vm.isCorrectValue(schemaFormGroup.controls[i].controls.dataType.value, controlValue) === false) {
              controls.controls[i].setErrors({invalidDataType: true});
            } else {
              controls.controls[i].setErrors(null);
            }
          }
        });
      }
    });
  }

  getPlaceholder(row, field) {
    let returnValue = '';

    const schema = <any>this.vm.fg.get('schema');
    const dataControls = <FormArray>this.vm.fg.get('data');

    if (row < dataControls.controls.length) {
      const fieldSchema = schema.controls[field].controls.dataType.value;
      switch (fieldSchema) {
        case 'Numeric':
          returnValue = '$ 2,500.00';
          break;
        case 'String':
          returnValue = 'Appliances';
          break;
        case 'Date':
          returnValue = '10/20/2017';
          break;
        case 'Boolean':
          returnValue = 'True';
          break;
      }
    }
    return returnValue;
  }

  getInputType(row, field) {
    let returnValue = '';

    const schema = <any>this.vm.fg.get('schema');
    const dataControls = <FormArray>this.vm.fg.get('data');

    if (row < dataControls.controls.length) {
      const fieldSchema = schema.controls[field].controls.dataType.value;
      switch (fieldSchema) {
        case 'Numeric':
          returnValue = 'number';
          break;
        case 'String':
          returnValue = 'text';
          break;
        case 'Date':
          returnValue = 'date';
          break;
        case 'Boolean':
          returnValue = 'checkbox';
          break;
      }
    }
    return returnValue;
  }

  toggleFullScreen(fullScreen) {
    this.fullScreen = fullScreen;
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { CustomFormViewModel } from '../../custom-datasource.viewmodel';

@Component({
  selector: 'kpi-schema-form',
  templateUrl: './schema-form.component.pug',
  styleUrls: ['./schema-form.component.scss']
})
export class SchemaFormComponent {
  @Input() schema: FormArray;

  constructor(
    private vm: CustomFormViewModel
  ) { }

  addSchema(): void {
    const that = this;
    that.schema.push(new FormGroup({}) as any);
  }

  removeSchema(schema: FormGroup) {
      if (!schema) {
          return;
      }

      const schemaIndex = this.schema.controls.findIndex(c => c === schema);

      if (schemaIndex > -1) {
          this.schema.removeAt(schemaIndex);
      }
  }

  moreThanOneDateField(schema: FormGroup) {
    const schemaIndex = this.schema.controls.findIndex(c => c === schema);
    const currentSchema = this.schema.controls[schemaIndex];

    const dateFields = this.schema.controls.filter(f => f.value.dataType === 'Date');

    if (currentSchema.value.dataType === 'Date' && dateFields.length > 1) {
      // this._updateDateRangeField();
      return true;
    } else {
      return false;
    }
  }

  // private _updateDateRangeField() {
  //     const dateRangeChecked = this.vm.fg.controls.schema.value.filter(f => f.dateRangeField === true);

  //     if (dateRangeChecked.length === 0) {
  //       const dateRangeIndex = this.vm.fg.controls.schema.value.findIndex(f => f.dataType === 'Date');
  //       ((this.vm.fg.get('schema') as FormArray).controls[dateRangeIndex] as FormArray).controls['dateRangeField'].value = true;
  //     }
  // }

}

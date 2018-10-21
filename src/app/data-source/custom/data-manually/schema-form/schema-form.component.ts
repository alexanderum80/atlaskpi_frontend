import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { CustomFormViewModel } from '../../custom-datasource.viewmodel';

@Component({
  selector: 'kpi-schema-form',
  templateUrl: './schema-form.component.pug',
  styleUrls: ['./schema-form.component.scss']
})
export class SchemaFormComponent {

  schemas: FormArray;
  // defaultDateRangeField: number;

  constructor(
    private vm: CustomFormViewModel
  ) {
    this.schemas = vm.fg.get('schema') as FormArray;
  }

  addSchema(): void {
    const that = this;
    that.schemas.push(new FormGroup({}) as any);
  }

  removeSchema(schema: FormGroup) {
      if (!schema) {
          return;
      }

      const schemaIndex = this.schemas.controls.findIndex(c => c === schema);

      if (schemaIndex > -1) {
          this.schemas.removeAt(schemaIndex);
      }
  }

  moreThanOneDateField(schema: FormGroup) {
    const schemaIndex = this.schemas.controls.findIndex(c => c === schema);
    const currentSchema = this.schemas.controls[schemaIndex];

    this.vm.fg.controls.dateRangeField.setValue(this.vm.fg.controls.schema.value.findIndex(f => f.dataType === 'Date'));

    const dateFields = this.schemas.controls.filter(f => f.value.dataType === 'Date');

    if (currentSchema.value.dataType === 'Date' && dateFields.length > 1) {
      return true;
    } else {
      return false;
    }
  }

}

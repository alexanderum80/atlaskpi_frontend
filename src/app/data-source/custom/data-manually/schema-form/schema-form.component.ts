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

}

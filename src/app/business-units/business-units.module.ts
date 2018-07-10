//  Angular Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

// App Code
import { BusinessUnitsRoutingModule } from './business-units-routing.module';

import { ListBusinessUnitsComponent } from './list-business-units/list-business-units.component';
import { AddBusinessUnitComponent } from './add-business-unit/add-business-unit.component';
import { EditBusinessUnitComponent } from './edit-business-unit/edit-business-unit.component';
import { BusinessUnitFormComponent } from './business-unit-form/business-unit-form.component';
import { SharedModule } from '../shared/index';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    NgxDatatableModule,
    BusinessUnitsRoutingModule,
    SharedModule
  ],
  declarations: [
     ListBusinessUnitsComponent,
     AddBusinessUnitComponent,
     EditBusinessUnitComponent,
     BusinessUnitFormComponent
  ]
})
export class BusinessUnitsModule { }

//  Angular Imports
import { SharedModule } from '../shared';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

// App Code
import { EmployeesRoutingModule } from './employees-routing.module';

import { ListEmployeesComponent } from './list-employees/list-employees.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { EditEmployeeComponent } from './edit-employee/edit-employee.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    SharedModule,
    NgxDatatableModule,
    EmployeesRoutingModule
  ],
  declarations: [
     ListEmployeesComponent,
     AddEmployeeComponent,
     EditEmployeeComponent,
     EmployeeFormComponent
  ]
})
export class EmployeesModule { }

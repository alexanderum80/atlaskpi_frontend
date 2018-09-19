import { ReactiveFormsModule } from '@angular/forms';
import { FormDepartmentComponent } from './form-department/form-department.component';
import { ListDepartmentsComponent } from './list-departments/list-departments.component';
import { DepartmentsRoutingModule } from './departments-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { AddDepartmentComponent } from './add-department/add-department.component';
import { EditDepartmentComponent } from './edit-department/edit-department.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../shared';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    DepartmentsRoutingModule,
    NgxDatatableModule,
    SharedModule
  ],
  declarations: [
     FormDepartmentComponent,
     ListDepartmentsComponent,
     AddDepartmentComponent,
     EditDepartmentComponent
  ]
})
export class DepartmentsModule { }

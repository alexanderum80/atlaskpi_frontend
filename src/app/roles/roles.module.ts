import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/index';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { AddRoleComponent } from './add-role/add-role.component';
import { EditRoleComponent } from './edit-role/edit-role.component';
import { ListRolesComponent } from './list-roles/list-roles.component';
import { RoleFormComponent } from './role-form/role-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialUserInterfaceModule,
    MaterialFormsModule,
    SharedModule,
    NgxDatatableModule
  ],
  declarations: [AddRoleComponent, EditRoleComponent, ListRolesComponent, RoleFormComponent],
  exports: [AddRoleComponent, ListRolesComponent]
})
export class RolesModule { }

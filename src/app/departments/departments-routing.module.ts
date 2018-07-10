import {
    EditDepartmentComponent
} from './edit-department/edit-department.component';
import {
    AddDepartmentComponent
} from './add-department/add-department.component';
import {
    NgModule
} from '@angular/core';
import {
    Routes,
    RouterModule
} from '@angular/router';
import {
    ListDepartmentsComponent
} from './list-departments/list-departments.component';
import {
    AuthGuard
} from '../shared/services';

const routes: Routes = [{
    path: 'departments',
    component: ListDepartmentsComponent,
    canActivate: [AuthGuard],
    children: [{
        path: 'add',
        component: AddDepartmentComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'edit/:id',
        component: EditDepartmentComponent,
        canActivate: [AuthGuard]
    }]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DepartmentsRoutingModule { }

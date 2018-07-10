// Angular Imports
import {
    NgModule
} from '@angular/core';
import {
    Routes,
    RouterModule
} from '@angular/router';

// Guard Service
import {
    AuthGuard
} from '../shared/services';

// Module Components
import {
    ListEmployeesComponent
} from './list-employees/list-employees.component';
import {
    AddEmployeeComponent
} from './add-employee/add-employee.component';
import {
    EditEmployeeComponent
} from './edit-employee/edit-employee.component';

const routes: Routes = [{
    path: 'employees',
    component: ListEmployeesComponent,
    canActivate: [AuthGuard],
    children: [{
        path: 'add',
        component: AddEmployeeComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'edit/:id',
        component: EditEmployeeComponent,
        canActivate: [AuthGuard]
    }]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmployeesRoutingModule { }

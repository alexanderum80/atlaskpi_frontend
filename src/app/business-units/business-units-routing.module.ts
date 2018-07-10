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
    ListBusinessUnitsComponent
} from './list-business-units/list-business-units.component';
import {
    AddBusinessUnitComponent
} from './add-business-unit/add-business-unit.component';
import {
    EditBusinessUnitComponent
} from './edit-business-unit/edit-business-unit.component';

const routes: Routes = [{
    path: 'business-units',
    component: ListBusinessUnitsComponent,
    canActivate: [AuthGuard],
    children: [{
        path: 'add',
        component: AddBusinessUnitComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'edit/:id',
        component: EditBusinessUnitComponent,
        canActivate: [AuthGuard]
    }]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BusinessUnitsRoutingModule { }

// Angular Imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Guard Service
import { AuthGuard } from '../shared/services';
// Module Components
import { ListLocationsComponent } from './list-locations/list-locations.component';
import { AddLocationComponent } from './add-location/add-location.component';
import { EditLocationComponent } from './edit-location/edit-location.component';

const routes: Routes = [{
    path: 'locations',
    component: ListLocationsComponent,
    canActivate: [AuthGuard],
    children: [{
        path: 'add',
        component: AddLocationComponent,
        canActivate: [AuthGuard]
    }, {
        path: 'edit/:id',
        component: EditLocationComponent,
        canActivate: [AuthGuard]
    }]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LocationsRoutingModule { }

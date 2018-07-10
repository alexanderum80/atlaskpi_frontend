// Angular Imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../shared/services';
import { AddKpiComponent } from './add-kpi/add-kpi.component';
import { EditKpiComponent } from './edit-kpi/edit-kpi.component';
import { CloneKpiComponent } from './clone-kpi/clone-kpi.component';
import { ListKpisComponent } from './list-kpis/list-kpis.component';
import { KpisComponent } from './kpis.component';

// Guard Service
// Module Components
const routes: Routes = [{
    path: 'kpis',
    component: KpisComponent,
    canActivate: [AuthGuard],
    children: [
        {
            path: 'list',
            component: ListKpisComponent,
            canActivate: [AuthGuard]
        },
        {
            path: 'add',
            component: AddKpiComponent,
            canActivate: [AuthGuard]
        },
        {
            path: 'edit/:id',
            component: EditKpiComponent,
            canActivate: [AuthGuard]
        },

        {
            path: 'clone/:id',
            component: CloneKpiComponent,
            canActivate: [AuthGuard]
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class KpisRoutingModule { }

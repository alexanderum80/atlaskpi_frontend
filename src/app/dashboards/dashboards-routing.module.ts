import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardsComponent } from './dashboards.component';
import { DashboardShowComponent } from './dashboard-show/dashboard-show.component';
import { NewDashboardComponent } from './new-dashboard/new-dashboard.component';
import { ListDashboardComponent } from './list-dashboard/list-dashboard.component';
import { AddDashboardComponent } from './add-dashboard/add-dashboard.component';
import { EditDashboardComponent } from './edit-dashboard/edit-dashboard.component';
import { AuthGuard } from '../shared/services';

const routes: Routes = [
  {
    path: 'dashboards', component: DashboardsComponent, canActivate: [ AuthGuard ], children:
    [
        { path: 'new', component: AddDashboardComponent, canActivate: [ AuthGuard ]},
        { path: 'add', component: AddDashboardComponent, canActivate: [ AuthGuard ] },
        { path: 'list', component: ListDashboardComponent, canActivate: [ AuthGuard ] },
        { path: `edit/:id`, component: EditDashboardComponent, canActivate: [ AuthGuard ] },
        { path: ':id', component: DashboardShowComponent, canActivate: [ AuthGuard ] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardsRoutingModule { }

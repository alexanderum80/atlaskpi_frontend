import { ListAllDataSourcesComponent } from './list-all-data-sources/list-all-data-sources.component';
import { DataSourceComponent } from './data-source.component';
import { ListConnectedDataSourcesComponent } from './list-connected-data-sources/list-connected-data-sources.component';
import { AuthGuard } from '../shared/services';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'datasource', component: DataSourceComponent, canActivate: [ AuthGuard ], children:
    [
        { path: '', redirectTo: '/listConnectedDataSourcesComponent', pathMatch: 'full' },
        { path: 'listConnectedDataSourcesComponent', component: ListConnectedDataSourcesComponent },
        { path: 'listAllDataSourcesComponent', component: ListAllDataSourcesComponent, canActivate: [AuthGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataSourceRoutingModule { }

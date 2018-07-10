import { EditChartComponent } from './edit-chart/edit-chart.component';
import { NewChartComponent } from './new-chart';
import { AuthGuard } from '../shared/services';
import { ChartTestComponent } from './chart-test/chart-test.component';
import { ChartsComponent } from './charts.component';
import { ListChartComponent } from './list-chart';
import { CloneChartComponent } from './clone-chart';


import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'charts', component: ChartsComponent, canActivate: [ AuthGuard ], children:
    [
        { path: '', redirectTo: '/list', pathMatch: 'full' },
        { path: 'list', component: ListChartComponent, canActivate: [ AuthGuard ] },
        { path: 'new', component: NewChartComponent, canActivate: [ AuthGuard ] },
        { path: 'test', component: ChartTestComponent, canActivate: [ AuthGuard ] },
        { path: 'edit/:id', component: EditChartComponent, canActivate: [ AuthGuard ] },
        { path: 'clone/:id', component: CloneChartComponent, canActivate: [ AuthGuard ] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChartsRoutingModule { }

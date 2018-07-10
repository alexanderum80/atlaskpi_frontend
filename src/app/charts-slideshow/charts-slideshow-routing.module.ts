import { EditChartsSlideshowComponent } from './edit-charts-slideshow/edit-charts-slideshow.component';
import { AddChartsSlideshowComponent } from './add-charts-slideshow/add-charts-slideshow.component';
import { ShowChartSlideshowComponent } from './show-chart-slideshow/show-chart-slideshow.component';
import { ListChartsSlideshowComponent } from './list-charts-slideshow/list-charts-slideshow.component';
import { AuthGuard } from '../shared/services';
import { ChartsSlideshowComponent } from './charts-slideshow.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'charts-slideshow', component: ChartsSlideshowComponent, canActivate: [ AuthGuard ], children:
    [
        { path: '', component: ListChartsSlideshowComponent, canActivate: [ AuthGuard ] },
        { path: 'add', component: AddChartsSlideshowComponent, canActivate: [ AuthGuard ] },
        { path: 'edit/:id', component: EditChartsSlideshowComponent, canActivate: [ AuthGuard ] },
        { path: 'show/:id', component: ShowChartSlideshowComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChartsSlideshowRoutingModule { }

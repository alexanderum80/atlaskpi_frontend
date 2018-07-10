import { SharedModule } from '../shared';
import { SelectedChartsService } from '../charts/shared/services/selected-charts.service';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartsModule } from '../charts';

import { MaterialUserInterfaceModule, MaterialFormsModule } from '../ng-material-components';

import { ChartsSlideshowRoutingModule } from './charts-slideshow-routing.module';
import { ChartsSlideshowComponent } from './charts-slideshow.component';
import { ListChartsSlideshowComponent } from './list-charts-slideshow/list-charts-slideshow.component';
import { ShowChartSlideshowComponent } from './show-chart-slideshow/show-chart-slideshow.component';
import { ChartSlideshowFormComponent } from './chart-slideshow-form/chart-slideshow-form.component';
import { EditChartsSlideshowComponent } from './edit-charts-slideshow/edit-charts-slideshow.component';
import { AddChartsSlideshowComponent } from './add-charts-slideshow/add-charts-slideshow.component';
import { DeleteModalComponent } from './delete-modal/delete-modal.component';
import { NoSlideshowsComponent } from './no-slideshows/no-slideshows.component';
import { ChartSlideshowService } from './shared/service/chartslideshow.service';

@NgModule({
  imports: [
    CommonModule,
    ChartsSlideshowRoutingModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    ChartsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [ChartsSlideshowComponent, ListChartsSlideshowComponent, ShowChartSlideshowComponent,
    ChartSlideshowFormComponent, EditChartsSlideshowComponent, AddChartsSlideshowComponent, DeleteModalComponent, NoSlideshowsComponent],
  providers: [ SelectedChartsService, ChartSlideshowService ]
})
export class ChartsSlideshowModule { }

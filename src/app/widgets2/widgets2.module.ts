import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Widgets2RoutingModule } from './widgets2-routing.module';
import { EmptyWidgetListComponent } from './empty-widget-list/empty-widget-list.component';
import { WidgetsComponent } from './widgets.component';
import { MaterialUserInterfaceModule, MaterialFormsModule } from '../ng-material-components';
import { NewWidgetComponent } from './new-widget/new-widget.component';
import { WidgetFormComponent } from './widget-form/widget-form.component';
import { SharedModule } from '../shared/index';
import { WidgetViewComponent } from './widget-view/widget-view.component';
import { WidgetPreviewComponent } from './widget-preview/widget-preview.component';
import { ChartModule } from 'angular-highcharts';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    Widgets2RoutingModule,
    MaterialUserInterfaceModule,
    MaterialFormsModule,
    ChartModule
  ],
  declarations: [EmptyWidgetListComponent, WidgetsComponent, NewWidgetComponent, WidgetFormComponent, WidgetViewComponent, WidgetPreviewComponent
  ],
  exports:[WidgetPreviewComponent]
})
export class Widgets2Module { }

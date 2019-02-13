import { WidgetsFormService } from './widget-form/widgets-form.service';
import { ChartsModule } from '../charts';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WidgetsRoutingModule } from './widgets-routing.module';
import { WidgetsComponent } from './widgets.component';
import { ListWidgetsComponent } from './list-widgets/list-widgets.component';
import { NewWidgetComponent } from './new-widget/new-widget.component';
import { EditWidgetComponent } from './edit-widget/edit-widget.component';
import { CloneWidgetComponent } from './clone-widget/clone-widget.component';

import { NoWidgetsComponent } from './no-widgets/no-widgets.component';
import { WidgetViewComponent } from './widget-view/widget-view.component';
import { WidgetSelectionFrameComponent } from './widget-selection-frame/widget-selection-frame.component';

import { ChartModule } from 'angular-highcharts';
import { WidgetFormComponent } from './widget-form/widget-form.component';
import { UserService } from '../shared/services';
import { WidgetAlertComponent } from './widget-alert/widget-alert.component';
import { WidgetAlertFormComponent } from './widget-alert-form/widget-alert-form.component';
import { WidgetNoAlertsComponent } from './widget-no-alerts/widget-no-alerts.component';
import { AutoRenderableWidgetComponent } from './auto-renderable-widget/auto-renderable-widget.component';
import { WidgetsAlertListComponent } from './widgets-alert-list/widgets-alert-list.component';
import { WidgetViewViewModel } from './widget-view/widget-view.viewmodel';
import { CloneWidgetActivity } from '../shared/authorization/activities/widgets/clone-widget.activity';
import { UpdateWidgetActivity } from '../shared/authorization/activities/widgets/update-widget.activity';
import { DeleteWidgetActivity } from '../shared/authorization/activities/widgets/delete-widget.activity';

@NgModule({
  imports: [
    CommonModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    ReactiveFormsModule,
    SharedModule,
    ChartModule,
    ChartsModule,
    WidgetsRoutingModule
  ],
  declarations: [WidgetsComponent, ListWidgetsComponent, NewWidgetComponent, EditWidgetComponent, CloneWidgetComponent,
                 NoWidgetsComponent, WidgetViewComponent, WidgetSelectionFrameComponent, WidgetFormComponent,
                 WidgetAlertComponent, WidgetAlertFormComponent, WidgetNoAlertsComponent, WidgetsAlertListComponent,
                 AutoRenderableWidgetComponent
                ],
  exports: [WidgetViewComponent, NewWidgetComponent, WidgetAlertComponent, WidgetAlertFormComponent,
            WidgetNoAlertsComponent, WidgetsAlertListComponent, AutoRenderableWidgetComponent],
  providers: [        
    CloneWidgetActivity, 
    UpdateWidgetActivity, 
    DeleteWidgetActivity, 
    WidgetsFormService, 
    UserService
  ]

})
export class WidgetsModule { }

import { SocialWidgetsModule } from './../social-widgets/social-widgets.module';
import { ChartMiniComponent } from './chart-mini';
import { WidgetsModule } from '../widgets';
import { SharedModule } from '../shared/index';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartsModule } from '../charts/charts.module';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';

import { DashboardsRoutingModule } from './dashboards-routing.module';
import { DashboardShowComponent, DashboardService, DashboardsComponent } from '.';
import { NewDashboardComponent } from './new-dashboard/new-dashboard.component';
import { ListDashboardComponent } from './list-dashboard/list-dashboard.component';
import { DashboardFormComponent } from './dashboard-form/dashboard-form.component';
import { AddDashboardComponent } from './add-dashboard/add-dashboard.component';
import { ListChartService } from '../charts/shared/services';
import { DashboardMenuComponent } from './shared/dashboard-menu/dashboard-menu.component';
import { DashboardMenuItemComponent } from './shared/dashboard-menu-item/dashboard-menu-item.component';
import { EditDashboardComponent } from './edit-dashboard/edit-dashboard.component';
import { MapsModule } from '../maps/maps.module';
import { DashboardFilterFormComponent } from './shared/dashboard-filter-form/dashboard-filter-form.component';
import { NavigationModule } from '../navigation/navigation.module';

@NgModule({
  imports: [
    CommonModule,
    DashboardsRoutingModule,
    NavigationModule,
    ChartsModule,
    WidgetsModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    SharedModule,
    MapsModule,
    SocialWidgetsModule,
  ],
  declarations: [DashboardsComponent, DashboardShowComponent,
     NewDashboardComponent,  ListDashboardComponent, DashboardFormComponent,
     AddDashboardComponent, DashboardMenuComponent, DashboardMenuItemComponent,
      EditDashboardComponent, ChartMiniComponent, DashboardFilterFormComponent],
  exports: [
    DashboardsComponent
  ],
  providers: [ DashboardService, ListChartService ]
})
export class DashboardsModule { }

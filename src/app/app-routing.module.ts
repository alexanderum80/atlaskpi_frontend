import { ShowAllDataEntryComponent } from './data-entry/show-all-data-entry/show-all-data-entry.component';
import { LoadingProfileComponent } from './loading-profile/loading-profile.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppointmentsComponent } from './appointments/appointments.component';
import { ListBusinessUnitsComponent } from './business-units/list-business-units/list-business-units.component';
import { ListChartsSlideshowComponent } from './charts-slideshow/list-charts-slideshow/list-charts-slideshow.component';
import { ListChartComponent } from './charts/list-chart';
import { ChartFormComponent } from './charts/shared/ui/chart-form';
import { DashboardShowComponent } from './dashboards/dashboard-show';
import {
    ListConnectedDataSourcesComponent,
} from './data-source/list-connected-data-sources/list-connected-data-sources.component';
import { ListDepartmentsComponent } from './departments/list-departments/list-departments.component';
import { ListEmployeesComponent } from './employees/list-employees/list-employees.component';
import { KpisComponent } from './kpis/kpis.component';
import { ListLocationsComponent } from './locations/list-locations/list-locations.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { PlaygroundComponent } from './playground/playground.component';
import { ListRolesComponent } from './roles/list-roles/list-roles.component';
import { SettingsComponent } from './settings/settings.component';
import { AuthGuard } from './shared/services';
import { ListUsersComponent } from './users/list-users';
import { StartComponent } from './users/start/start.component';
import { UsersComponent } from './users/users';
import { ListWidgetsComponent } from './widgets/list-widgets/list-widgets.component';
import { WidgetsComponent } from './widgets/widgets.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { FormTargetsComponent } from './targets/form-targets/form-targets.component';
import { AlertsComponent } from './alerts/alerts.component';
import { MobileWelcomeComponent } from './mobile-welcome/mobile-welcome.component';

const routes: Routes = [
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'loading-profile', component: LoadingProfileComponent },
  { path: 'start', component: StartComponent },
  { path: '', component: DashboardShowComponent, canActivate: [ AuthGuard ] },
  { path: 'dashboards', component: DashboardShowComponent, canActivate: [ AuthGuard ] },
  { path: 'users', component: UsersComponent },
  { path: 'charts', component: ListChartComponent, canActivate: [ AuthGuard ] },
  { path: 'charts-slideshow', component: ListChartsSlideshowComponent, canActivate: [ AuthGuard ]},
  { path: 'data-entry', component: ShowAllDataEntryComponent, canActivate: [ AuthGuard ]},
  { path: 'charts/format', component: ChartFormComponent, canActivate: [AuthGuard] },
  { path: 'kpis', component: KpisComponent, canActivate: [AuthGuard] },
  { path: 'datasource', component: ListConnectedDataSourcesComponent, canActivate: [AuthGuard] },
  { path: 'departments', component: ListDepartmentsComponent, canActivate: [AuthGuard] },
  { path: 'business-units', component: ListBusinessUnitsComponent, canActivate: [AuthGuard] },
  { path: 'locations', component: ListLocationsComponent, canActivate: [AuthGuard] },
  { path: 'employees', component: ListEmployeesComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'settings/users', component: ListUsersComponent, canActivate: [AuthGuard] },
  { path: 'settings/roles', component: ListRolesComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },
  { path: 'appointments', component: AppointmentsComponent, canActivate: [AuthGuard] },
  { path: 'widgets', component: ListWidgetsComponent, canActivate: [AuthGuard] },
  { path: 'playground', component: PlaygroundComponent },
  { path: 'widgets2', component: WidgetsComponent },
  { path: 'targets', component: FormTargetsComponent},
  { path: 'alerts', component: AlertsComponent},
  { path: 'mobile-menu', component: MobileWelcomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

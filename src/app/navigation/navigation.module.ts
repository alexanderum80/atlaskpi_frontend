import { ResultGroupsComponent } from './global-search/results-groups/result-groups.component';
import { SearchResultsComponent } from './global-search/search-results/search-results.component';
import { AddDashboardActivity } from '../shared/authorization/activities/dashboards/add-dashboard.activity';
import { SideBarViewModel } from './sidebar/sidebar.viewmodel';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ChartsModule } from '../charts';
import { DataSourceModule } from '../data-source/';
import { KpisModule } from '../kpis/kpis.module';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { RolesModule } from '../roles/roles.module';
import { SettingsModule } from '../settings/';
import { FooterComponent } from './footer/footer.component';
import { GlobalSearchComponent } from './global-search/global-search.component';
import { HeaderComponent } from './header/header.component';
import { NewVersionComponent } from './new-version/new-version.component';
import { SidebarItemComponent } from './sidebar/sidebar-item/sidebar-item.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DemoOptionsComponent } from './demo-options/demo-options.component';
import { AppointmentsModule } from '../appointments/appointments.module';
import { ActivitiesModule } from '../activities/activities.module';
import { SidebarService } from './sidebar/sidebar.service';
import { UsersModule } from '../users/users.module';
import { SharedModule } from '../shared';
import { HelpCenterComponent } from './help-center/help-center.component';
import { TitleVideoComponent } from './help-center/title-video/title-video.component';
import { ResultDetailsComponent } from './global-search/results-details/result-details.component';
import { ResultDetailsItemComponent } from './global-search/result-details-item/result-details-item.component';
import { SearchResultViewModel } from './global-search/search-results/search-results.viewmodel';


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        MaterialUserInterfaceModule,
        MaterialFormsModule,
        ChartsModule,
        KpisModule,
        DataSourceModule,
        RolesModule,
        SettingsModule,
        AppointmentsModule,
        ActivitiesModule,
        UsersModule,
    ],
    declarations: [
        SidebarComponent,
        HeaderComponent,
        FooterComponent,
        SidebarItemComponent,
        GlobalSearchComponent,
        NewVersionComponent,
        DemoOptionsComponent,
        HelpCenterComponent,
        TitleVideoComponent,
        SearchResultsComponent,
        ResultGroupsComponent,
        ResultDetailsComponent,
        ResultDetailsItemComponent
    ],
    exports: [
        SidebarComponent,
        HeaderComponent,
        FooterComponent,
        DemoOptionsComponent
    ],
    providers: [
        SideBarViewModel,
        AddDashboardActivity,
        SidebarService,
        SearchResultViewModel
    ]
})
export class NavigationModule {}

import { ServerSideDataSourceService } from './shared/services/data-source.service/server-side-data-sources.service';
import { SquareAuthService } from './shared/services/data-source-auth.services/square-auth.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { DataSourceRoutingModule } from './data-source-routing.module';
import { ListAllDataSourcesComponent } from './list-all-data-sources/list-all-data-sources.component';
import { DataSourceComponent } from './data-source.component';
import { ListConnectedDataSourcesComponent } from './list-connected-data-sources/list-connected-data-sources.component';
import { DataSourceService } from './shared/services/data-source.service/data-source.service';
import { HashLocationStrategy, Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { FacebookAuthService } from './shared/services/data-source-auth.services/facebook-auth.service';
import { InstagramAuthService } from './shared/services/data-source-auth.services/instagram-auth.service';
import { TwitterAuthService } from './shared/services/data-source-auth.services/twitter-auth.service';
import { YoutubeAuthService } from './shared/services/data-source-auth.services/youtube-auth.service';
import { GoogleAnaliticsAuthService } from './shared/services/data-source-auth.services/google-analitics-auth.service';
import { NoDatasourcesComponent } from './no-datasources/no-datasources.component';
import { SharedModule } from '../shared';
import { CallRailComponent } from './call-rail/call-rail.component';
import { CallRailApikeyTooltipComponent } from './call-rail/call-rail-apikey-tooltip/call-rail-apikey-tooltip.component';
import { CallRailAccountidTooltipComponent } from './call-rail/call-rail-accountid-tooltip/call-rail-accountid-tooltip.component';
import { RadioGroupService } from '../ng-material-components/modules/forms/radio/radio-group.service';

@NgModule({
  imports: [
    CommonModule,
    DataSourceRoutingModule,
    ReactiveFormsModule,
    MaterialUserInterfaceModule,
    MaterialFormsModule,
    SharedModule
  ],
  declarations: [DataSourceComponent, ListAllDataSourcesComponent, ListConnectedDataSourcesComponent,
                  NoDatasourcesComponent, CallRailComponent, CallRailApikeyTooltipComponent,
                  CallRailAccountidTooltipComponent,
                ],
  exports: [DataSourceComponent, ListAllDataSourcesComponent, ListConnectedDataSourcesComponent
  ],
  providers: [
    DataSourceService, ServerSideDataSourceService,
    FacebookAuthService, InstagramAuthService, TwitterAuthService, YoutubeAuthService,
    GoogleAnaliticsAuthService, SquareAuthService, RadioGroupService
  ]
})
export class DataSourceModule { }


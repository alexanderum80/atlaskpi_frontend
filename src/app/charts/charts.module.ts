import { TableModeService } from './chart-view/table-mode/table-mode.service';
import { MilestonesModule } from '../milestones';
import { ChartViewDashboardComponent } from './chart-view-dashboard/chart-view-dashboard.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartModule, HIGHCHARTS_MODULES } from 'angular-highcharts';

import { ChartsRoutingModule } from './charts-routing.module';
import { ChartViewComponent } from './chart-view/chart-view.component';
import { SetGoalComponent } from './chart-view/set-goal';
import { EditChartFormatComponent } from './chart-view/edit-chart-format';
import { DownloadChartViewComponent } from './chart-view/download-chart-view';
import { TableModeComponent } from './chart-view/table-mode';

// import { MyDatePickerModule } from 'mydatepicker';

import {
    MaterialUserInterfaceModule,
    MaterialFormsModule
} from '../ng-material-components';

import { SharedModule } from '../shared';
import { ChartTestComponent } from './chart-test/chart-test.component';
import { ChartsComponent } from './charts.component';
import { ListChartComponent } from './list-chart/list-chart.component';
import { ChartViewMiniComponent } from './chart-view-mini/chart-view-mini.component';
import { NewChartComponent } from './new-chart/new-chart.component';
import { ChartGalleryComponent } from './shared/ui/chart-gallery/chart-gallery.component';
import { ChartBasicInfoComponent } from './shared/ui/chart-basic-info/chart-basic-info.component';
import { ChartPreviewComponent } from './shared/ui/chart-preview/chart-preview.component';
import { ChartGalleryItemComponent } from './shared/ui/chart-gallery-item/chart-gallery-item.component';
import { ChartFormatInfoComponent } from './shared/ui/chart-format-info/chart-format-info.component';
import { ChartTypeComponent } from './shared/ui/chart-type/chart-type.component';
import { ChartInspectorComponent } from './chart-inspector/chart-inspector.component';
import { ChartItemDetailsComponent } from './shared/ui/chart-item-details/chart-item-details.component';
import { EditChartComponent } from './edit-chart/edit-chart.component';
import { ChartFormComponent } from './shared/ui/chart-form/chart-form.component';
import { CloneChartComponent } from './clone-chart/clone-chart.component';
import { EditGoalComponent } from './chart-view/set-goal/edit-goal/edit-goal.component';
import { NewGoalComponent } from './chart-view/set-goal/new-goal/new-goal.component';

// import { NgDateRangePickerModule } from 'ng-daterangepicker';
import { ChangeSettingsOnFlyComponent } from './chart-view/change-settings-on-fly/change-settings-on-fly.component';
import { TargetTooltipComponent } from './chart-view/set-goal/target-tooltip/target-tooltip.component';
import { AutoRendereableChartComponent } from './auto-rendereable-chart/auto-rendereable-chart.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TargetFormComponent } from './chart-view/set-goal/target-form/target-form.component';
import { ChartDetailFilterComponent } from './shared/ui/chart-detail-filter/chart-detail-filter.component';
import { ScrollEventModule } from 'ngx-scroll-event';

import threeD from 'highcharts/highcharts-3d.src';
import exporting from 'highcharts/modules/exporting.src';
import offlineExporting from 'highcharts/modules/offline-exporting.src';
import exportData from 'highcharts/modules/export-data.src';
import { TargetsModule } from '../targets/targets.module';


export function highchartsModules() {
  // apply Highcharts Modules to this array
  return [ threeD, offlineExporting, exporting, exportData ];
}

@NgModule({
  imports: [
    CommonModule,
    ChartsRoutingModule,
    ChartModule,
    MaterialUserInterfaceModule,
    MaterialFormsModule,
    SharedModule,
    NgxDatatableModule,
    MilestonesModule,
    ScrollEventModule,
    TargetsModule
  ],
  declarations: [ChartViewComponent, SetGoalComponent, EditChartFormatComponent, DownloadChartViewComponent, ChartTestComponent,
                 ChartsComponent, ListChartComponent, ChartViewMiniComponent, NewChartComponent, ChartGalleryComponent,
                 ChartBasicInfoComponent, ChartPreviewComponent, ChartGalleryItemComponent, ChartFormatInfoComponent, ChartTypeComponent,
                 ChartInspectorComponent, ChartItemDetailsComponent, EditChartComponent, ChartFormComponent, TableModeComponent,
                 CloneChartComponent, EditGoalComponent, NewGoalComponent, ChartViewDashboardComponent, ChangeSettingsOnFlyComponent,
                 TargetTooltipComponent, AutoRendereableChartComponent, TargetFormComponent, ChartDetailFilterComponent ],
  exports: [ChartViewComponent, SetGoalComponent, EditChartFormatComponent, DownloadChartViewComponent, ListChartComponent,
    ChartViewDashboardComponent, ChartViewMiniComponent, AutoRendereableChartComponent, NewChartComponent],
  providers: [
    { provide: HIGHCHARTS_MODULES, useFactory: highchartsModules },
    TableModeService
  ]
})
export class ChartsModule { }

import { ChangeSettingsOnFlyFilterListComponent } from './chart-view/change-settings-on-fly/filters/filter-list/filter-list.component';
import { ChangeSettingsOnFlyFilterFormComponent } from './chart-view/change-settings-on-fly/filters/filter-form/filter-form.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartModule, HIGHCHARTS_MODULES } from 'angular-highcharts';
import threeD from 'highcharts/highcharts-3d.src';
import exportData from 'highcharts/modules/export-data.src';
import exporting from 'highcharts/modules/exporting.src';
import offlineExporting from 'highcharts/modules/offline-exporting.src';
import { ScrollEventModule } from 'ngx-scroll-event';

import { MilestonesModule } from '../milestones';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { SharedModule } from '../shared';
import { TargetsModule } from '../targets/targets.module';
import { AutoRendereableChartComponent } from './auto-rendereable-chart/auto-rendereable-chart.component';
import { ChartTestComponent } from './chart-test/chart-test.component';
import { ChartViewDashboardComponent } from './chart-view-dashboard/chart-view-dashboard.component';
import { ChartViewMiniComponent } from './chart-view-mini/chart-view-mini.component';
import { ChangeSettingsOnFlyComponent } from './chart-view/change-settings-on-fly/change-settings-on-fly.component';
import { ChartViewComponent } from './chart-view/chart-view.component';
import { DownloadChartViewComponent } from './chart-view/download-chart-view';
import { EditChartFormatComponent } from './chart-view/edit-chart-format';
import { TableModeComponent } from './chart-view/table-mode';
import { TableModeService } from './chart-view/table-mode/table-mode.service';
import { ChartsRoutingModule } from './charts-routing.module';
import { ChartsComponent } from './charts.component';
import { CloneChartComponent } from './clone-chart/clone-chart.component';
import { EditChartComponent } from './edit-chart/edit-chart.component';
import { ListChartComponent } from './list-chart/list-chart.component';
import { NewChartComponent } from './new-chart/new-chart.component';
import { ChartBasicInfoComponent } from './shared/ui/chart-basic-info/chart-basic-info.component';
import { ChartDetailFilterComponent } from './shared/ui/chart-detail-filter/chart-detail-filter.component';
import { ChartFormComponent } from './shared/ui/chart-form/chart-form.component';
import { ChartFormatInfoComponent } from './shared/ui/chart-format-info/chart-format-info.component';
import { ChartGalleryItemComponent } from './shared/ui/chart-gallery-item/chart-gallery-item.component';
import { ChartGalleryComponent } from './shared/ui/chart-gallery/chart-gallery.component';
import { ChartItemDetailsComponent } from './shared/ui/chart-item-details/chart-item-details.component';
import { ChartPreviewComponent } from './shared/ui/chart-preview/chart-preview.component';
import { ChartTypeComponent } from './shared/ui/chart-type/chart-type.component';
import { MapsModule } from '../maps/maps.module';
import highchartEvents from 'highcharts-custom-events';
import { ChartComparisonComponent } from './chart-view/chart-comparison/chart-comparison.component';
import { ChooseColorsComponent } from './shared/ui/choose-colors/choose-colors.component';

// import { MyDatePickerModule } from 'mydatepicker';

// import { NgDateRangePickerModule } from 'ng-daterangepicker';
export function highchartsModules() {
    // apply Highcharts Modules to this array
    return [threeD, offlineExporting, exporting, exportData, highchartEvents];
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
        TargetsModule,
        MapsModule,
    ],
    declarations: [
        ChartViewComponent,
        EditChartFormatComponent,
        DownloadChartViewComponent,
        ChartTestComponent,
        ChartsComponent,
        ListChartComponent,
        ChartViewMiniComponent,
        NewChartComponent,
        ChartGalleryComponent,
        ChartBasicInfoComponent,
        ChartPreviewComponent,
        ChartGalleryItemComponent,
        ChartFormatInfoComponent,
        ChartTypeComponent,
        ChartItemDetailsComponent,
        EditChartComponent,
        ChartFormComponent,
        TableModeComponent,
        CloneChartComponent,
        ChartViewDashboardComponent,
        ChangeSettingsOnFlyComponent,
        AutoRendereableChartComponent,
        ChartDetailFilterComponent,
        ChartComparisonComponent,
        ChooseColorsComponent,
        ChangeSettingsOnFlyFilterListComponent,
        ChangeSettingsOnFlyFilterFormComponent
    ],
    exports: [
        ChartViewComponent,
        EditChartFormatComponent,
        DownloadChartViewComponent,
        ListChartComponent,
        ChartViewDashboardComponent,
        ChartViewMiniComponent,
        AutoRendereableChartComponent,
        NewChartComponent,
        EditChartComponent,
        ChooseColorsComponent,
    ],
    providers: [{ provide: HIGHCHARTS_MODULES, useFactory: highchartsModules }, TableModeService],
})
export class ChartsModule {}

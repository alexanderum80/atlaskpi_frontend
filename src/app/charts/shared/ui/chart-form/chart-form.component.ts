import { from } from 'apollo-link';
import { IChartDateRange } from './../../../../shared/models/date-range';
import { CommonService } from '../../../../shared/services/common.service';
import {
    AfterViewInit,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    ViewEncapsulation,
    OnDestroy,
    ViewChild
} from '@angular/core';
import { FormGroup, FormArray, Validators } from '@angular/forms';
import { Apollo, QueryRef } from 'apollo-angular';
import { isBoolean, isEmpty, map, cloneDeep } from 'lodash';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { SelectionItem } from '../../../../ng-material-components';
import { IKPI } from '../../../../shared/domain/kpis/kpi';
import { ToSelectionItemList } from '../../../../shared/extentions';
import { DialogResult } from '../../../../shared/models/dialog-result';
import { BrowserService } from '../../../../shared/services/browser.service';
import { prepareChartDefinitionForPreview, processChartActivityChange } from '../../extentions';
import { allKpisWithData, KpisQuery } from '../../graphql';
import { PreviewChartQuery } from '../../graphql/charts.gql';
import { ChartModel, IChartFormValues } from '../../models';
import { ChartGalleryService } from '../../services';
import { TooltipFormats } from '../chart-format-info/tooltip-formats';
import { CustomFormat } from '../chart-format-info/tooltip-custom-formats';
import { IChartSize } from '../chart-preview';
import { chartsGraphqlActions } from '../../graphql/charts.graphql-actions';
import { SelectedChartsService, IChart } from '../..';
import { ApolloService } from '../../../../shared/services/apollo.service';

import { groupBy, includes } from 'lodash';
import { FormControl } from '@angular/forms';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { ChartFormatInfoComponent } from '../chart-format-info/chart-format-info.component';
import { IMapMarker } from '../../../../maps/shared/models/map-marker';
import { objectWithoutProperties } from '../../../../shared/helpers/object.helpers';
import { MapModel, IMapFormValues } from '../../../../maps/shared/models/map.models';
import { UserService } from '../../../../shared/services';


const Highcharts = require('highcharts/js/highcharts');
const getChartByTitle = require('graphql-tag/loader!../../graphql/get-chart-by-title.gql');
const mapMarkersQuery = require('graphql-tag/loader!src/app/maps/show-map/map-markers.query.gql');
const getKpisToMaps = require('graphql-tag/loader!../../graphql/kpisToMaps.query.gql');

const initialDefinition = {
    chart: {
        type: 'pie'
    },
    title: undefined,
    plotOptions: {
        pie: {
            dataLabels: {
                enabled: true,
                format: '{point.name}:<br/> <b>{point.y:,.2f} ({point.percentage:.2f}%)</b>'
            },
            showInLegend: true
        }
    },
    series: [],
    exporting: {
        enabled: false
    },
    credits: {
        enabled: false,
        href: 'http://www.atlaskpi.com',
        text: 'Powered by AtlasKPI'
    }
};

const chartDefinitionFromKPI = {
    chart: {
        type: 'column'
    },
    title: undefined,
    plotOptions: {
        column: {
            dataLabels: {
                enabled: true,
                format: '{point.name}:<br/> <b>{point.y:,.2f} ({point.percentage:.2f}%)</b>'
            },
            showInLegend: true,
            stacking: 'normal'
        }
    },
    tooltip: {
        altas_definition_id: 'multiple_percent',
        enabled: true,
        formatter: 'kpi_tooltip_with_percentage_and_total',
        shared: true,
        useHTML: true
    },
    series: [],
    exporting: {
        enabled: false
    },
    credits: {
        enabled: false,
        href: 'http://www.atlaskpi.com',
        text: 'Powered by AtlasKPI'
    }
};
const ChartTypes = [{
    id: 1,
    title: 'Line'
},
{
    id: 2,
    title: 'Area'
},
{
    id: 3,
    title: 'Column'
},
{
    id: 4,
    title: 'Bar'
},
{
    id: 7,
    title: 'Pie'
},
];

interface Itypography {
    enable: boolean;
    black: boolean;
    cursive: boolean;
    under: boolean;
    size: string;
    color: string;
}

@Component({
    selector: 'kpi-chart-form',
    templateUrl: './chart-form.component.pug',
    styleUrls: ['./chart-form.component.scss'],
    providers: [ChartGalleryService],
    encapsulation: ViewEncapsulation.None
})
export class ChartFormComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
    @Input() fg: FormGroup;
    @Input() chartModel: ChartModel;
    @Input() mapModel: MapModel;
    @Input() chartId: string;
    @Input() chartDataFromKPI: any;
    @Input() isnewChartOrMap: boolean;
    @Input() isFromDashboard: boolean;
    @Input() chartType = 'pie';
    @Output() result = new EventEmitter < DialogResult > ();
    @ViewChild(ChartFormatInfoComponent) ChartFormatInfo: ChartFormatInfoComponent;

    public sortingCriteriaList: SelectionItem[] = [];
    chartDefinition: any;
    sortingChart: any;
    kpis: IKPI[] = [];
    dashboardList: SelectionItem[] = [];
    kpiList: SelectionItem[] = [];
    viewportSizeSub: Subscription;
    chartSize: IChartSize;
    mapMarkers: any[] = [];

    // // DEFINICION DE VARIABLES DEL TOOLTIP
    // format: string;
    // decimals: number;
    // pointFormat: string;
    custom: CustomFormat;

    private _chartDetailsSubject = new Subject<any>();
    private _previewQuery: QueryRef<any>;
    private _previewQuerySubscription: Subscription;
    private _previousChartDetails: any;

    private _subscription: Subscription[] = [];

    canSave = false;
    isEdit = false;
    ischartTypeMap = false;

    constructor(private _apollo: Apollo,
        private _galleryService: ChartGalleryService,
        private _apolloService: ApolloService,
        private _selectChartService: SelectedChartsService,
        private _browserService: BrowserService,
        private _user: UserService) {
        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });
        this.chartDefinition = initialDefinition;
        this._setChartType();
    }

    ngOnInit() {
        this._dashboardsQuery();
        const that = this;

        this.viewportSizeSub = this._browserService.viewportSize$.subscribe(s => {
            if (s.width < 600) {
                const width = s.width * 0.8;

                that.chartSize = {
                    width: width,
                    height: width * 0.9
                };
            } else if (s.width > 600) {
                const width = s.width / 2 * 0.8;

                that.chartSize = {
                    width: width,
                    height: width * 0.9
                };
            }
        });
        // initialize tooltip info
        this.custom = this.getCustom();
    }

    ngOnChanges(changes) {
    }

    ngAfterViewInit() {
        if (this.isFromDashboard && this.chartType === 'map') {
            this.loadKpisToMaps();
        }
        // if (this.isFromDashboard && this.chartType === 'chart') { this.chartType = 'pie'; }

        // create form array for kpis
        this.fg.addControl('kpis', new FormArray([]));

        const loadingGroupings = new FormControl(false);
        this.fg.addControl('loadingGroupings', loadingGroupings);

        const loadingComparison = new FormControl(false);
        this.fg.addControl('loadingComparison', loadingComparison);

        this._subscribeToChartSelection();
        const that = this;
        that.fg.valueChanges.debounceTime(500)
           .subscribe(values => {
               if (this.ischartTypeMap) {
                // Here i must run the query
                // to obtain map data
                if (this.fg.value.kpi && this.fg.value.kpi !== ''
                    && (this.fg.value.predefinedDateRange !== ''
                    || this.fg.value.predefinedDateRange === 'custom' && this.fg.value.customFrom !== ''
                    && this.fg.value.customTo !== '')) {
                    that._bringMapMarkers();
                }
                this.canSave = this.formValid;
               } else {
                    if (this.chartModel) {
                        that.processFormatChanges(values)
                            .then(() => that.previewChartQuery());
                    }
               }
            });
        this._selectChartService.updateExistDuplicatedName(false);
        this._subscribeToNameChanges();
    }

    ngOnDestroy() {
        if (this.viewportSizeSub) {
            this.viewportSizeSub.unsubscribe();
        }
        if (this._previewQuerySubscription) {
            this._previewQuerySubscription.unsubscribe();
        }
        CommonService.unsubscribe(this._subscription);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        const height = window.outerHeight;
        const width = window.outerWidth;

        let chartWidth: number;
        let chartHeight: number;

        if (width < 400) {
            chartWidth = 290;
            chartHeight = 260;
        }
    }

    private loadKpisToMaps() {
        this._apolloService.networkQuery <any> (getKpisToMaps)
        .then(res => {
            this.kpis = res.KpisSourcesMaps;
            this.kpiList = ToSelectionItemList(this.kpis, '_id', 'name');
        });
    }

    private _bringMapMarkers() {
        const that = this;
        let tmpDateRange: IChartDateRange;
        if (this.fg.value.predefinedDateRange === 'custom') {
            tmpDateRange = {
                predefined: 'custom',
                custom: {
                    from: this.fg.value.customFrom,
                    to: this.fg.value.customTo
                }
            };
        } else {
            tmpDateRange = {
                predefined: this.fg.value.predefinedDateRange,
                custom: undefined
            };
        }
        this._subscription.push(
            this._apolloService.networkQuery <any> (mapMarkersQuery, { input:
                { dateRange: JSON.stringify(tmpDateRange),
                    grouping: this.fg.value.grouping ? [this.fg.value.zipCodeSource, this.fg.value.grouping] : [this.fg.value.zipCodeSource],
                    kpi: this.fg.value.kpi
                } })
                .then(res => {
                    that.mapMarkers = res.mapMarkers.map(m => objectWithoutProperties(m, ['__typename']));
                }));
        }

    saveChart() {
        this.result.emit(DialogResult.SAVE);
    }

    cancel() {
        this.result.emit(DialogResult.CANCEL);
    }

    previewChart() {
        this.result.emit(DialogResult.PREVIEW);
    }

    processFormatChanges(values: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            setTimeout(() => {
                if (!this.chartDefinition) {
                    return resolve();
                }
                if (!this.isEdit &&
                    this.chartDefinition &&
                    this.chartDefinition.chart &&
                    this.chartDefinition.chart.type) {
                    this._galleryService.updateToolTipList(this.chartDefinition.chart.type);

                }
                this.canSave = this.formValid;
                // x axis
                if (!isEmpty(values.xAxisTitle)) {
                    this.chartDefinition.xAxis = Object.assign({}, this.chartDefinition.xAxis || {}, {
                        title: {
                            text: values.xAxisTitle
                        }
                    });
                }
                // y axis
                if (!isEmpty(values.yAxisTitle)) {
                    this.chartDefinition.yAxis = Object.assign({}, this.chartDefinition.yAxis || {}, {
                        title: {
                            text: values.yAxisTitle
                        }
                    });
                }
                // gridlines
                if (!isEmpty(values.removeGridlines)) {
                    this.chartDefinition.yAxis = Object.assign({}, this.chartDefinition.removeGridlines || {}, {
                        removeGridlines: 0
                    });
                }

                if (!this.chartDefinition.chart) {
                    this.chartDefinition.chart = {};
                }
                // legend,
                this._processLegendChanges(values);
                // series
                this._processSerieChanges(values);
                // tooltip
                this._processTooltipChanges(values);
                // invert axis
                this._processInvertedAxisChanges(values);
                // remove gridlines
                this._proccessRemoveGridlines(values);
                console.log(this.chartDefinition);
                return resolve();
            });
        });
    }

    updateFormFields() {
        const that = this;
        let values: any;
        if (this.mapModel) {
            values = this.mapModel.toMapFormValues();
        } else {
            values = this.chartDataFromKPI ? this.chartDataFromKPI : this.chartModel.toChartFormValues();
        }

        this.ChartFormatInfo.defaultChartColors();

        this._subscription.push(
            this._kpisQuery().subscribe(({ data }) => {
                that.kpis = data.kpis;
                that.kpiList = ToSelectionItemList(that.kpis, '_id', 'name');

                if (!values) {
                    return;
                }

                that.isEdit = true;
            // this.chartType = this.chartModel.type;
                if (this.chartModel) {
                    that.chartDefinition = this.chartDataFromKPI ? chartDefinitionFromKPI : that.chartModel.chartDefinition;
                    that._galleryService.updateToolTipList(that.chartDefinition.chart.type);

                    if (that.chartDefinition && !this.chartDataFromKPI) {
                        that.chartType = (that.chartModel.type || that.chartDefinition.chart.type);
                    } else {
                        that.chartType = (that.chartDefinition && this.chartDataFromKPI) ?
                            chartDefinitionFromKPI.chart.type :
                            initialDefinition.chart.type;
                    }
                } else if (MapModel) {
                    that.chartType = 'map';
                }
                // Update formgroup
                setTimeout(function () {
                    // in this stage we are updating controls with no dependency
                    that.fg.controls['name'].patchValue(values.name);
                    that.fg.controls['description'].patchValue(values.description);
                    that.fg.controls['predefinedDateRange'].patchValue(values.predefinedDateRange);
                    that.fg.controls['predefinedTop'].patchValue(values.predefinedTop);
                    if (values.mapsize) {
                        const mapsize = that.fg.controls['mapsize'];
                        if (!mapsize) {
                            that.fg.addControl('mapsize', new FormControl(values.mapsize));
                        } else {
                            mapsize.patchValue(values.mapsize);
                        }
                    }
                    if (values.predefinedDateRange === 'custom') {
                        const customFrom = that.fg.controls['customFrom'];

                        if (!customFrom) {
                            that.fg.addControl('customFrom', new FormControl(values.customFrom));
                        } else {
                            customFrom.patchValue(values.customFrom);
                        }

                        const customTo = that.fg.controls['customTo'];
                        if (!customTo) {
                            that.fg.addControl('customTo', new FormControl(values.customTo));
                        } else {
                            customFrom.patchValue(values.customTo);
                        }
                    }

                    if (values.predefinedTop === 'other') {
                        const customTop = that.fg.controls['customTop'];

                        if (!customTop) {
                            that.fg.addControl('customTop', new FormControl(values.customTop));
                        } else {
                            customTop.patchValue(values.customTop);
                        }
                    }

                    that.fg.controls['frequency'].patchValue(values.frequency);
                    that.fg.controls['group'].patchValue(values.group);

                    that.fg.controls['dashboards'].setValue(values.dashboards.replace(',', '|'));
                }, 100);

                // Update properties dependants on other fields
                setTimeout(function () {
                    // depends on the kpi list
                    // that.fg.controls['kpi'].patchValue(values.kpiIds);
                    that.fg.controls['kpi'].patchValue((<any>values).kpiIds.map(k => new FormControl(k, Validators.required)));

                    if (values.predefinedDateRange === 'custom') {
                        that.fg.controls['customFrom'].patchValue(values.customFrom);
                        that.fg.controls['customTo'].patchValue(values.customTo);
                    }

                }, 400);

                setTimeout(function () {
                    // depends on the selected kpi
                    that.fg.controls['sortingCriteria'].setValue(values.sortingCriteria);
                    that.fg.controls['sortingOrder'].setValue(values.sortingOrder);
                    // tooltip selection
                    if (values.tooltipEnabled) {
                        that.fg.controls['tooltipEnabled'].setValue(values.tooltipEnabled);
                    }

                    // data labels selection
                    if (isBoolean(values.seriesDataLabels)) {
                        that.fg.controls['seriesDataLabels'].setValue(values.seriesDataLabels);
                    }
                }, 600);

                setTimeout(() => {
                    if (that.fg.value.tooltipEnabled) {
                        that.fg.controls['predefinedTooltipFormat'].setValue(values.predefinedTooltipFormat);
                    }
                }, 800);
                setTimeout(() => {
                    that.fg.controls['xAxisSource'].setValue(values.xAxisSource);
                    if (that.fg.controls['grouping'] && values.grouping) {

                        let groupingValue;
                        // groupings is an array for maps an string for charts
                        if (Array.isArray(values.grouping) && values.grouping.length === 2 ) {
                            groupingValue = values.grouping[1];
                        } else if (Array.isArray(values.grouping)) {
                            groupingValue = '';
                        } else {
                            groupingValue = values.grouping;
                        }
                        that.fg.controls['grouping'].setValue(groupingValue);

                    }
                    // zipCodeSource
                    if (that.fg.controls['zipCodeSource'] && values.zipCodeSource) {
                        that.fg.controls['zipCodeSource'].setValue(values.zipCodeSource);
                    }
                    // depends on the daterange selection
                    that.fg.controls['comparison'].setValue(values.comparison);
                }, 1000);

                this.ChartFormatInfo.getSerieColorForChartDefinition(this.chartDefinition);
            })
        );
    }

    getChartDefinition(): any {
        // this fixes the issue of big charts when created or edited from the chart management screen
        if (this.chartDefinition.chart.height) {
            delete this.chartDefinition.chart.height;
        }

        if (this.chartDefinition.chart.width) {
            delete this.chartDefinition.chart.width;
        }

        return this.chartDefinition;
    }

    setChartDefinition(definition: any) {
        this.chartDefinition = definition;
    }

    isLegendsEnabled() {
        if (!this.chartModel) {
            return false;
        } else {
            return (!this.chartModel.hasOwnProperty('chartDefinition') || !this.chartModel.chartDefinition.hasOwnProperty('legend')) ?
                true : this.chartModel.chartDefinition['legend']['enabled'];
        }
    }

    isInvertAxisEnabled() {
        if (!this.chartModel) {
            return false;
        } else {
            return (!this.chartModel.hasOwnProperty('chartDefinition') || !this.chartModel.chartDefinition.hasOwnProperty('invertAxis')) ?
                false : this.chartModel.chartDefinition['invertAxis']['enabled'];
        }
    }
    // remove gridlines
    isRemoveGridlinesEnabled() {
        if (!this.chartModel) { return false; }
        if (!this.chartModel.hasOwnProperty('chartDefinition') || !this.chartModel.chartDefinition.hasOwnProperty('yAxis') ||
        this.chartModel.chartDefinition['yAxis']['gridLineWidth'] !== 0) {
            return false;
        }
        return true;
    }

    getCustom() {
        if (!this.chartModel) {
            return new CustomFormat();
        } else {
            return (!this.chartModel.hasOwnProperty('chartDefinition') ||
            !this.chartModel.chartDefinition.hasOwnProperty('tooltip') ||
            !this.chartModel.chartDefinition.tooltip.hasOwnProperty('custom'))
            ? new CustomFormat() : this.chartModel.chartDefinition.tooltip.custom;
        }
    }

    get isPredefinedTopOther() {
        return this.fg.value.predefinedTop === 'other';
    }

    get isChartCustomTopValid() {
        const customTop = this.fg.value.customTop;
        const customTopValue = parseInt(customTop, 10);

        if (this.isPredefinedTopOther && !customTop) {
            return false;
        }

        if (customTop && (customTopValue > 20 || customTopValue <= 0)) {
            return false;
        }
        return true;
    }

    get isMapSizeValid() {
        return this.fg.value.mapsize && this.fg.value.mapsize.length > 0;
    }

    get formValid() {
        if (this.ischartTypeMap) {
            return this.fg.value.name !== undefined && this.fg.value.name.length > 1 &&
                this.fg.value.kpi !== undefined && this.fg.value.kpi.length > 0 &&
                this.fg.value.predefinedDateRange !== undefined && this.isMapSizeValid;
        } else {
            return !isEmpty(this.fg.value.name) &&
            !isEmpty(this.fg.value.kpi) &&
            !isEmpty(this.fg.value.predefinedDateRange) &&
            this.isChartCustomTopValid &&
            this.tooltipValid;
        }
    }

    get tooltipValid(): boolean {
        if (!this.fg.value.tooltipEnabled) {
            return true;
        }

        if (this.fg.value.tooltipCustomEnabled) {
            return true;
        }

        return this.fg.value.predefinedTooltipFormat ? true : false;
    }

    private _updateDashboardList(): SelectionItem[] {
        // in this method we put a mark on the items who contains the chart
        const that = this;
        let chartDashboardsIds: String[] = [];
        if (this.chartModel) {
        chartDashboardsIds = this.chartModel.dashboards ?
            this.chartModel.dashboards.map(d => d._id) : [];
        } else {
            chartDashboardsIds = this.mapModel.dashboards ?
            this.mapModel.dashboards.map(d => d) : [];
        }
        this.fg.controls['dashboards'].setValue(chartDashboardsIds.join('|'));
        return this.dashboardList;
    }

    private _dashboardsQuery() {
        const that = this;
        this._apollo.query < {
            dashboards: [{
                _id: string,
                name: string
            }]
        } > ({
            query: chartsGraphqlActions.dashboardList,
            fetchPolicy: 'network-only'
        }).toPromise().then(result => {
            that.dashboardList = result.data.dashboards.map(d => new SelectionItem(d._id, d.name)) || [];
            this._updateDashboardList();
        });
    }

    private _kpisQuery(): any {
        // const that = this;
        // this._subscription.push(this._apollo.watchQuery < {
        //         kpis: IKPI[]
        //     } > ({
        //         query: KpisQuery,
        //         fetchPolicy: 'network-only'
        //     })
        //     .valueChanges.subscribe(({
        //         data
        //     }) => {
        //         that.kpis = data.kpis;
        //         that.kpiList = ToSelectionItemList(that.kpis, '_id', 'name');
        //     }));
        return this._apollo.watchQuery < {
                getAllKPIs: IKPI[]
            } > ({
                query: KpisQuery,
                fetchPolicy: 'network-only'
            })
            .valueChanges;
    }

    previewChartQuery() {
        if (!this._previewQuerySubscription) {
            this._subscribeToPreviewQuery();
        }

        this.processFormatChanges(this.fg.value);
        const model = ChartModel.fromFormGroup(this.fg, this.chartDefinition);
        const loadingGroupings = (this.fg.get('loadingGroupings') || {} as FormControl).value || false;
        const loadingComparison = (this.fg.get('loadingComparison') || {} as FormControl).value || false;

        if (this._previewValid(model) && !loadingGroupings && !loadingComparison)  {

            // Apollo doesnt send the property when using Link Batch, if the data type is not the same as in the schema
            // so we are forcing the daterange to be an array of DateRanges.
            (<any>model).dateRange = [model.dateRange];

            this._previewQuery.refetch({ input: model }).then(res => this._processChartPreview(res.data));
        }
    }

    private _previewValid(model): boolean {
        return model && model.chartDefinition && model.validForPreview;
    }

    private _subscribeToPreviewQuery() {
        const that = this;
        this._previewQuery = this._apollo.watchQuery < string > ({
                query: PreviewChartQuery,
                variables: {
                    input: {}
                },
                fetchPolicy: 'network-only'
            });
    }

    private _processChartPreview(data) {
        if (!data || !( < any > data).previewChart || (<any>data).previewChart === 'null') {
            return;
        }
        const chart = JSON.parse(( < any > data).previewChart);
        this.chartModel = new ChartModel(chart);

        if (chart) {
            if (!chart.chartDefinition) {
                chart.chartDefinition = {};
            }
            this.chartModel.chartDefinition = prepareChartDefinitionForPreview(chart.chartDefinition);
        }

        this.chartDefinition = this.chartModel.chartDefinition;
        const series = this.chartDefinition ? this.chartDefinition.series : [];
        this._galleryService.updateSortingCriteriaList(this.fg.value, series);
    }

    private _subscribeToChartSelection() {
        const that = this;

        this._subscription.push(this._galleryService.activeChart$.subscribe((chart) => {
            this.ischartTypeMap = chart.name === 'map';
            if (!this.ischartTypeMap) {
                that._galleryService.getChartSampleDefinition( < any > chart.type, chart)
                    .subscribe((sampleChart) => {
                        processChartActivityChange(that, chart, sampleChart);
                    });
                }
        }));
    }

    private _processLegendChanges(values) {
        // legend is on
        if (values.legendEnabled) {
            const legend = {
                enabled: values.legendEnabled
            };
            if (legend.enabled) {
                Object.assign(legend, {
                    align: values.legendAlign || 'center'
                });
                Object.assign(legend, {
                    verticalAlign: values.legendVerticalAlign || 'bottom'
                });
                Object.assign(legend, {
                    layout: values.legendLayout || 'horizontal'
                });
            }
            this.chartDefinition.legend = legend;
        } else {
            this.chartDefinition.legend = Object.assign({}, {
                enabled: values.legendEnabled
            });
        }
    }

    private _processInvertedAxisChanges(values) {
        // inverted axis
        // this.chartDefinition.chart.inverted = false;
        //  return values.invertedAxis ? this.chartDefinition.chart.inverted = !this.chartDefinition.chart.inverted : false  ;
        const newValue = (values.invertedAxis) ? true : false;

        if (this.chartDefinition.chart.inverted !== newValue) {
            this.chartDefinition.chart.inverted = newValue;
            // const model = ChartModel.fromFormGroup(this.fg, this.chartDefinition);

            // ** Raul Commented this to prevent an issue with the preview chart not showing
            // if (this._previewQuery && this._previewValid(model)) {
            //     this._previewQuery.refetch({ input: model }).then(res => this._processChartPreview(res.data));
            // }
        }
    }
    // remove gridlines
     private _proccessRemoveGridlines(values) {
        const newValue = (values.removeGridlines) ? true : false;

        // ** Raul Commented this to prevent an issue with the preview chart not showing
        // const model = ChartModel.fromFormGroup(this.fg, this.chartDefinition);
        // if (this._previewQuery && this._previewValid(model)) {
        //     this._previewQuery.refetch({ input: model }).then(res => this._processChartPreview(res.data));
        // }
    }

    private _processSerieChanges(values) {
        const chartType = this.chartDefinition.chart.type;
        const plotOptions = this.chartDefinition.plotOptions || {};
        if (!plotOptions[chartType]) {
            plotOptions[chartType] = {};
        }
        let dataLabels = {
            enabled: false
        };
        if (plotOptions[chartType].dataLabels) {
            dataLabels = this.chartDefinition.plotOptions[chartType].dataLabels;
        }
        if (values.seriesDataLabels) {
            dataLabels = Object.assign(dataLabels, {
                enabled: true,
                format: '<b>{point.y:,.2f}</b>'
            });
            plotOptions[chartType].dataLabels = dataLabels;
            this.chartDefinition.plotOptions = plotOptions;
        } else {
            dataLabels.enabled = false;
            plotOptions[chartType] = Object.assign({}, plotOptions[chartType], {
                dataLabels: dataLabels
            });
            this.chartDefinition.plotOptions = Object.assign({}, plotOptions);
        }
    }

    private _setChartType() {
        if (this.chartDefinition && this.chartDefinition.chart.hasOwnProperty('type')) {
            if (this.chartType !== this.chartDefinition.chart.type) {
                this.chartType = this.chartDefinition.chart.type;
            }
        }
    }

    // PROCESA LOS CAMBIOS DEL TOOLTIP
    private _processTooltipChanges(values) {

        const newValue = values.tooltip;

      /* if (this.chartDefinition.chart.tooltip !== newValue) {
            this.chartDefinition.chart.tooltip = newValue;
            const model = ChartModel.fromFormGroup(this.fg, this.chartDefinition);
            this._chartDetailsSubject.next(model);
        }*/

        if (!values.tooltipEnabled) {
            this.chartDefinition.tooltip = Object.assign({}, { enabled: false });
            return;
        }
        let tooltip: any;
        this.updateTooltipChanges();

        if (values.tooltipEnabled && !this.fg.value.tooltipCustomEnabled) {
            const tooltipFormatList = cloneDeep(TooltipFormats);
            tooltip = tooltipFormatList.find(t => t.id === values.predefinedTooltipFormat);
            tooltip = tooltip ? tooltip.definition : tooltip;
        } else {
            tooltip = Object.assign(
                {
                    useHTML: true,
                    altas_definition_id: this.custom.altas_definition_id,
                    enabled: true,
                    custom: this.custom,
                    shared: (values.shared ? values.shared : false),
                    crosshairs: (values.crosshairs ? values.crosshairs : false),
                    formatter: this.custom,
                });
        }
        if (tooltip) {
            this.chartDefinition.tooltip = tooltip;
        }
    }

    // CAPTURA EL EVENTO Y MODIFICA LAS VARIABLES
    processTooltipChanges(tooltip?: any) {
        if (tooltip.format !== '') {
            this.custom.altas_definition_id = tooltip.format;
        }
        this.custom.decimals = tooltip.valueDecimals;
        const that = this;
         // definition.tooltip.formatter = formatterFactory.getFormatter(definition.tooltip.formatter).exec;
          tooltip.formatter = tooltip.format;

        // this.processFormatChanges(this.fg.value)
           // .then(() => that.previewChartQuery());

    }

    private updateTooltipChanges() {
        this.custom.enableCustom = this.fg.value.tooltipCustomEnabled;

        this.custom.xValue.enable = this.fg.value.includeX;
        this.custom.xValue.color = this.fg.value.colorX;
        this.custom.xValue.size = this.fg.value.sizeX;

        this.custom.serieValue.enable = this.fg.value.includeSerie;
        this.custom.serieValue.color = this.fg.value.colorSerie;
        this.custom.serieValue.size = this.fg.value.sizeSerie;
        this.custom.totalValue.enable = this.fg.value.includeTotal;
        this.custom.totalValue.color = this.fg.value.colorTotal;
        this.custom.totalValue.size = this.fg.value.sizeTotal;

        this.custom.yValueColor = this.fg.value.colorY;

        this.custom.prefix = this.fg.value.addPrefix;
        this.custom.suffix = this.fg.value.addSuffix;

        this.custom.shared = this.fg.value.shared;
        this.custom.crosshairs = this.fg.value.crosshairs;
       // this.chartDefinition.tooltip.formatter = this.chartDefinition.tooltip;

        const model = ChartModel.fromFormGroup(this.fg, this.chartDefinition);
        this._chartDetailsSubject.next(model);
    }

    private _subscribeToNameChanges() {
        if (!this.fg.controls['name']) { return; }

        this.fg.controls['name'].valueChanges.subscribe(name => {
            if (name === '') {
                this.fg.controls['name'].setErrors({required: true});
            } else {
                if (this._selectChartService.getExistDuplicatedName() === true) {
                    this._apolloService.networkQuery < IChart > (getChartByTitle, { title: name }).then(d => {
                        if (d.getChartByTitle && d.getChartByTitle._id !== (this.chartId ? this.chartId : 0)) {
                            this.fg.controls['name'].setErrors({forbiddenName: true});
                        } else {
                            this.fg.controls['name'].setErrors(null);
                        }
                    });
                }
            }
        });
    }

    processLabelItemColors(labelItems) {
        const serieColors: string[] = [];

        labelItems.map(item => {
            if (item.color !== '') {
                serieColors.push(item.color);
            }
        });
        this.chartDefinition.colors = serieColors;

        this.previewChartQuery();
    }

    openSelectColor(SerieName) {
        this.ChartFormatInfo.openSelectColor(SerieName);
    }

    processSerieColors(newChartDefinition) {
        this.chartDefinition = newChartDefinition;
        this.previewChartQuery();
    }

}





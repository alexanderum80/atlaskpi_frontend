import { AfterContentInit, Component, Input, OnDestroy, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { Options } from 'highcharts';
import { get as _get, isEmpty, isNumber, isString, pick } from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import SweetAlert from 'sweetalert2';
import { FormatterFactory, yAxisFormatterProcess } from '../../dashboards/shared/extentions/chart-formatter.extention';
import { MilestoneService } from '../../milestones/shared/services/milestone.service';
import { MenuItem } from '../../ng-material-components';
import { ChangeSettingsOnFlyActivity } from '../../shared/authorization/activities/charts/change-settings-on-fly-chart.activity';
import { CompareOnFlyActivity } from '../../shared/authorization/activities/charts/compare-on-fly-chart.activity';
import { DownloadChartActivity } from '../../shared/authorization/activities/charts/download-chart.activity';
import { SeeInfoActivity } from '../../shared/authorization/activities/charts/see-info-chart.activity';
import { AddTargetActivity } from '../../shared/authorization/activities/targets/add-target.activity';
import { ViewTargetActivity } from '../../shared/authorization/activities/targets/view-target.activity';
import { parseComparisonDateRange, parsePredefinedDate } from '../../shared/models';
import { IDateRangeItem, PredefinedDateRanges, IStringChartDateRange, convertDateRangeToStringDateRange } from '../../shared/models/date-range';
import { DialogResult } from '../../shared/models/dialog-result';
import { IChartDateRange } from '../../shared/models/index';
import { IChartTop } from '../../shared/models/top-n-records';
import { ApolloService } from '../../shared/services/apollo.service';
import { BrowserService } from '../../shared/services/browser.service';
import { CommonService } from '../../shared/services/common.service';
import { OverlayComponent } from '../../shared/ui/overlay/overlay.component';
import { DrillDownService } from '../shared/services/drilldown.service';
import { predefinedColors } from './../shared/ui/chart-format-info/material-colors';
import { ChartViewViewModel } from './chart-view.viewmodel';
import { TableModeService } from './table-mode/table-mode.service';
import { Router} from '@angular/router';


const Highcharts = require('highcharts/js/highcharts');

const ChartQuery = gql`
    query Chart($id: String, $input: GetChartInput) {
        chart(id: $id, input: $input)
     }
`;

const kpiOldestDateQuery = require('graphql-tag/loader!../shared/ui/chart-basic-info/kpi-get-oldestDate.gql');
export enum frequencyEnum {
    Daily = 'daily',
    Weekly = 'weekly',
    Monthly = 'monthly',
    Quartely = 'quarterly',
    Yearly = 'yearly'
  }

export interface IChartTreeNode {
    id: string;
    parent: IChartTreeNode;
    children: IChartTreeNode[];
    definition: any;
    title: string;
    targetList: any[];
    rootChart: boolean;
    dateRange: IChartDateRange[];
    frequency: string;
    groupings: string[];
    isDataOnFly: boolean;
    comparison: string[];
    isDrillDown: boolean;
    isCompared: boolean;
    year?: string | number;
}

export interface ChartData {
    _id: string;
    dateFrom: string;
    dateTo: string;
    name: string;
    description: string;
    group: string;
    kpis: any[];
    top: IChartTop;
    sortingCriteria: string;
    sortingOrder: string;
    chartDefinition: Options;
    targetList?: any[];
    futureTarget?: boolean;
    comparison?: string[];
    availableComparison?: string[];
    dateRange: any;
    frequency: string;
    title: string;
    subtitle: string;
    groupings: string[];
    xAxisSource: string;
}

export interface DateRange {
    from: string;
    to: string;
}

export interface IChartVariable {
    id: string;
    dateRange: DateRange;
    frequency;
    string;
}

export interface ChartResponse {
    chart: string;
}
export interface IRunRate {
    name: string;
    colorIndex: number;
    data: number;
}

@Component({
    selector: 'kpi-chart-view',
    templateUrl: './chart-view.component.pug',
    styleUrls: ['./chart-view.component.scss'],
    providers: [
        DrillDownService, CommonService, MilestoneService,
        ChartViewViewModel, ViewTargetActivity, AddTargetActivity,
        ChangeSettingsOnFlyActivity, CompareOnFlyActivity,
        SeeInfoActivity, DownloadChartActivity
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartViewComponent implements OnInit, OnDestroy, AfterContentInit {
    @Input() chartData: ChartData;
    @Input() dateRanges: IDateRangeItem[] = [];
    @Input() isFromDashboard = false;
    @ViewChild(OverlayComponent) overlay: OverlayComponent;

    @Input() dashBoardId: string;
    @Output() chartSelectedDashId = new EventEmitter();
    @Output() editChartId = new EventEmitter();
    
    private _subscription: Subscription[] = [];

    chart: any; // Chart;
    title: string;
    description: string;
    showDescription = false;
    descriptionAnimation = 'fadeIn';
    actionItemsTarget: string;
    maximized = false;
    chartSubscription: QueryRef<ChartResponse>;
    hasFutureTargets: boolean;

    drillUpAnimation = 'fadeInLeft';
    isDrillDownTargetAllow = true;
    frequencyToUpdate: string;
    dateRangeToUpdate: any;
    predefinedDateRangeToUpdate: string;
    from: string;
    to: string;
    groupingsToUpdate: string;
    dataSource: string;
    filterData: any[];
    isDataOnFly = false;
    chartOnFly: Chart;
    N_Result: any;
    formatSortingCrit: any;

    rootNode: IChartTreeNode;
    currentNode: IChartTreeNode;

    comparisonDateRange: any[] = [];
    comparisonValue: string[] = [];
    loadedComparisonData = false;
    isDateRangeInPresent = false;
    isfrequencyToRunRate = false;
    isTargets = false;
    iscollapsed = true;
    enableRunRate = false;
    frequencyName = '';
    previousfreq = 0;
    neededFrequency = 0;
    totalFrequency = 0;
    isStack = false;
    isComparison = false;
    originalChartData: any;
    runrateValues:IRunRate[] = [];
    totalrunrateValues = 0;
    targetsVisible = false;

    userTouchSub: Subscription;
    userTouching: boolean;


    compareActions: MenuItem[] = [{
        id: 'comparison',
        icon: 'swap',
        children: []
    },
    {
        id: 'maximize',
        icon: 'window-maximize',
    }
    ];

    actionItems: MenuItem[] = [{
        id: '3',
        icon: 'more-vert',
        children: [
            {
                id: 'change-settings-on-fly',
                title: 'Change settings on the fly',
                icon: 'settings',
            },
            {
                id: 'toggle-description',
                icon: 'info-outline',
                title: 'Info',

            },
            {
                id: 'download-chart',
                icon: 'download',
                title: 'Download'
            },
            {
                id: 'edit-chart',
                title: 'Edit',
                icon: 'edit'
            },
            {
                id: 'set-target',
                title: 'Targets',
                icon: 'check'
            },
            {
                id: 'run-rate',
                title: 'Run Rate',
                icon: 'trending-up'
            },
            {
                id: 'table-mode',
                title: 'Table View',
                icon: 'grid'
            },
            {
                id: 'remove-this-dashboard',
                icon: 'delete',
                title: 'Remove from dashboard'
             }
        ]
    }];


    constructor(private _apollo: Apollo,
        private _router: Router,
        private _broserService: BrowserService,
        private _drillDownSvc: DrillDownService,
        private _commonService: CommonService,
        private _tableModeService: TableModeService,
        public vm: ChartViewViewModel,
        public addTargetActivity: AddTargetActivity,
        public viewTargetActivity: ViewTargetActivity,
        public changeSettingsOnFlyActivity: ChangeSettingsOnFlyActivity,
        public compareOnFlyActivity: CompareOnFlyActivity,
        public seeChartInfoActivity: SeeInfoActivity,
        public downloadChartActivity: DownloadChartActivity,
        private _apolloService: ApolloService) {
        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            },
            exporting: {
                contextButton: {}
            }
        });

    }

    ngOnInit() {
        this.vm.addActivities([
            this.viewTargetActivity, this.addTargetActivity,
            this.changeSettingsOnFlyActivity,
            this.seeChartInfoActivity, this.compareOnFlyActivity,
            this.downloadChartActivity
        ]);
        this.isDateRangeInPresent = this.getDateRangeInPresent();
        this.isfrequencyToRunRate = this.getFrecuencyToRunRate();
        this.isTargets = this.getIsTargets();
        this.isComparison = this.getIsComparison();
        this.AnalizeFrequency();
        this.getShowRunRate();

        this.userTouchSub = this._broserService.userTouching$.subscribe(val => this.userTouching = val)

    }

    ngAfterContentInit() {
        if (!this.chartData) {
            return;
        }

        // sometimes this.chartData is a string
        if (isString(this.chartData)) {
            this.chartData = JSON.parse(this.chartData as any);
        }

        if (this.hasCustomDateRange) {
            this.getDateRange(this.chartData.dateRange[0].custom);
        }

        if (this.hasKpiFilter) {
            this.getFilterData();
        }

        if (this.hasKpiExpression) {
            const expression = this.chartData.kpis[0].expression.substr(this.chartData.kpis[0].expression.indexOf('(') + 1,
            this.chartData.kpis[0].expression.length);
            this.dataSource = expression.substr(0, expression.indexOf('.'));
        }

        if (this.chartData.availableComparison && this.chartData.availableComparison.length > 0) {
            this._updateComparisonOptions();
        }

        if (this.chartData.comparison && this.chartData.comparison.length > 0) {
            this.getComparisonValue();
            this.getComparisonDateRange();
        }

        if (this.chartData.top) {
            
            if (this.chartData.top.predefined ) {
                
                if (this.chartData.top.predefined === 'other') {
                    this.N_Result = this.chartData.top.custom;
                } else {
                    this.N_Result = this.chartData.top.predefined.substr(4,3);
                }
            }
        }

        if (this.chartData.sortingCriteria && this.chartData.sortingOrder ) {

            let scValue = this.chartData.sortingCriteria;

            for (let i = 0;  i < scValue.length; i++) {
                
                if (scValue[i] === scValue[i].toUpperCase()) {
                    this.formatSortingCrit = this.chartData.sortingCriteria.replace(scValue[i], ' ' + scValue[i].toLocaleLowerCase())
                }
            }

            if (!this.formatSortingCrit) {

                this.formatSortingCrit = scValue;
            }
        }

        if (this.chartData && this.chartData.chartDefinition && this.chartData.chartDefinition.chart) {
            this.chartData.chartDefinition.chart.zoomType = 'x';
        }

        if (this.chartData && this.chartData.chartDefinition) {
            this.chart = new Chart(this.chartData.chartDefinition);
            this.chart.options.exporting = {
                enabled: false,
                filename: this.title
            };
            this._updateChartInfoFromDefinition();
            this.enableDrillDown();

            // TODO: Improve this
            // this fixes the issue of charts outside the container
            // https://www.e-learn.cn/content/wangluowenzhang/133147
            // this forces the chart to get the container height
            // setTimeout(() => {
            //     this.chart.ref.reflow();
            // }, 0);

            // Highcarts 6 offers and Observable of the ChartObject
            this.chart.ref$.subscribe(ref => {
                setTimeout(() => {
                    ref.reflow();
                }, 0);
            });
        }

        if (this.chart instanceof Chart) {
            if (!this._hasSeries()) {
                this._commonService.disableChildrenActionItems(this.actionItems, ['download-chart', 'table-mode']);
            }

            this._disableTargetOption();

            this._disableMenuItem();
            this._disableCompareActionItems(this.compareActions);

            this.getChart();
            this._resetOverlayStyle();
            this.hasFutureTargets = this._checkFutureTarget(this.chartData) !== undefined;

            // the new version of highchart options is private
            const c: any = this.chart;

            if (this._broserService.isMobile()) {
                const chartPlotOptions = c.options.plotOptions[c.options.chart.type];
                c.options.plotOptions[c.options.chart.type] = Object.assign({}, chartPlotOptions, {
                    dataLabels: {
                        enabled: false
                    }
                });

                // this should fix the legend overlapping the chart on mobile
                if (c.options.legend && c.options.legend.enabled) {
                    const legendOptions = {
                        floating: false,
                        maxHeight: 120,
                        y: 5
                    };
                    c.options.legend = Object.assign(c.options.legend, legendOptions);
                }

            }
        }

        this.rootNode = {
            id: null,
            parent: null,
            children: [],
            definition: this.chartData.chartDefinition,
            title: this.title,
            targetList: this.chartData.targetList,
            rootChart: true,
            year: null,
            groupings: this.chartData.groupings,
            dateRange: this.chartData.dateRange,
            frequency: this.chartData.frequency,
            isDataOnFly: false,
            isDrillDown: false,
            isCompared: false,
            comparison: this.chartData.comparison
        };

        this.currentNode = this.rootNode;
        if (this.currentNode.definition.chart.type === 'pie') {
            this.loadedComparisonData = true;
        } else {
            this._updateComparisonOptions();
        }
    }

    getDateRangeInPresent(): boolean {
        try {
            if (!this.chartData.dateRange) { return false }
            if (this.chartData.dateRange[0].custom.from && this.chartData.dateRange[0].custom.to) {
                const dateRange = parsePredefinedDate('this year');
                const from: Date = this.chartData.dateRange[0].custom.from;
                const to: Date = this.chartData.dateRange[0].custom.to;
                if (from >= dateRange.from && to <= dateRange.to) {
                    // Custom Date Range is in present
                    return true;
                }
            } else if (this.chartData.dateRange[0].predefined) {
                if (this.chartData.dateRange[0].predefined.includes('this year')) {
                    return true;
                }
            }
            return false;
        } catch (err) {
            return false;
        }
    }

    getFrecuencyToRunRate(): boolean {
        return this.chartData.frequency === 'quarterly' ||
        this.chartData.frequency === 'monthly' ||
        this.chartData.frequency === 'weekly' ;
    }

    getIsTargets(): boolean {
        const that = this;
        return that.chartData.targetList && that.chartData.targetList.length !== 0;
      }
    getIsComparison(): boolean {
        const that = this;
        return that.chartData.comparison && that.chartData.comparison.length !== 0;
    }

    getShowRunRate() {
        if (!this.isDateRangeInPresent || !this.isfrequencyToRunRate || !this.chartData.chartDefinition.series) {
            this._commonService.disableChildrenActionItems(
                this.actionItems, ['run-rate']);
        }
    }

    ngOnDestroy() {
        this.chartData = null;

        if(this.userTouchSub){
            this.userTouchSub.unsubscribe();
        }

        CommonService.unsubscribe([
            ...this._subscription,
        ]);
    }

    getComparisonValue() {
        const dateRange = this.dateRanges.find(d => d.dateRange.predefined === this.chartData.dateRange[0].predefined);
        if (!dateRange) { return; }
        this.comparisonValue = [];
        this.chartData.comparison.map( comp => {
            const comparison = dateRange.comparisonItems.find(c => c.key === comp);
            if (!comparison) {
                this.comparisonValue.push(comp.substr(0, comp.indexOf('YearsAgo')) + ' years ago');
            } else {
                this.comparisonValue.push(comparison.value);
            }
        });
    }

    getComparisonDateRange() {
        if (!this.chartData.comparison) { return; }
        let comparison: string[] = [];
        let customDateRange;
        if (this.chartData.dateRange[0].predefined === 'custom') {
            customDateRange = this.chartData.dateRange[0].custom;
        }
        this.chartData.comparison.map(comp => {
            comparison = [];
            comparison.push(this.chartData.dateRange[0].predefined);
            comparison.push(comp);
            this.comparisonDateRange.push(<any>parseComparisonDateRange(<any>comparison, customDateRange));
        });
    }

    setSettingsOnFly(predefinedDateRange: string, dateRange: DateRange, frequency: string, groupings: string) {
        this.dateRangeToUpdate = dateRange;
        this.frequencyToUpdate = frequency;
        this.predefinedDateRangeToUpdate = predefinedDateRange;
        this.groupingsToUpdate = groupings;

        this.updateSettingsOnFly();
        this.subscribeToChartUpdates();
    }

    updateSettingsOnFly() {
        const that = this;
        const dr = this.dateRangeToUpdate;

        const inputData = {
            dateRange: [{
                predefined: this.predefinedDateRangeToUpdate,
                custom: dr ? { from: dr.from, to: dr.to } : null
            }],
            groupings: this.groupingsToUpdate && this.groupingsToUpdate !== '' ? this.groupingsToUpdate : null,
            frequency: this.frequencyToUpdate && this.frequencyToUpdate !== '' ? this.frequencyToUpdate : null,
            xAxisSource: '',
            isDrillDown: false,
            comparison: [],
            onTheFly: true,
        };

        that.chartSubscription = this._apollo.watchQuery<ChartResponse>({
            query: ChartQuery,
            variables: {
                id: that.chartData._id,
                input: inputData
            },
            fetchPolicy: 'network-only'
        });

        this.isDataOnFly = true;
    }

    closeRunRate() {
        this.chartSubscription.refetch({
            id: this.chartData._id
        }).then(({ data }) => {
            this.enableRunRate = false;
            this.chartData = JSON.parse(data.chart);
            this.processChartUpdate(data.chart);
        });
    }

    closeSettingOnFly() {
        // this.isSettingsOnFly = !this.isSettingsOnFly;
        // this._isSettingsOnFly();
        const that = this;
        const predefined = this.currentNode.parent.dateRange[0].predefined || null;
        const groupings = this.currentNode.parent.groupings;
        const frequency = this.currentNode.parent.frequency;

        let custom;
        if (isEmpty(this.currentNode.parent.dateRange[0]) ||
            !this.currentNode.parent.dateRange[0].custom ||
            !this.currentNode.parent.dateRange[0].custom.from) {
            custom = null;
        } else {
            custom = this.currentNode.parent.dateRange[0].custom;
        }

        const dr: IStringChartDateRange = convertDateRangeToStringDateRange(
            {
                predefined,
                custom
            }
        );

        this.chartSubscription.refetch({
            id: this.chartData._id,
            input: {
                dateRange: [dr],
                groupings: groupings,
                frequency: frequency,
                isDrillDown: false
            }
        }).then(({ data }) => {
            that.isDataOnFly = false;
            that.processChartUpdate(data.chart);
        });

        // disable target options when settings on the fly
        this._commonService.disableChildrenActionItems(this.actionItems, ['set-target']);
    }

    isDrillDownAvailable(): boolean {
        const onFly: boolean = this.currentNode.isDataOnFly;
        const drillDown: boolean = this.currentNode.isDrillDown;
        const comparison: boolean = this.currentNode.isCompared;

        const onFlyAndIsDrillDown: boolean = onFly && drillDown;
        const isDrillDownAndNotOnFly: boolean = drillDown && !onFly;

        const isComparison = comparison && !onFly && !drillDown;

        return onFlyAndIsDrillDown || isDrillDownAndNotOnFly || isComparison;
    }

    enableDrillDown() {
        const that = this;

        if (!this.chart.options.plotOptions) {
            this.chart.options.plotOptions = {
                series: {}
            };
        }

        if (!this.chart.options.plotOptions.series) {
            this.chart.options.plotOptions.series = {};
        }

        /* 
                
                code for mobile drilldown starts here

        */
        if (this._broserService.isMobile() || this.userTouching) {
            // click in highcharts on data point
            // not where there is space
            this.chart.options.plotOptions.series = Object.assign(this.chart.options.plotOptions.series, {
                point: {
                    events: {
                        click: function (event) {
                            const isShared: boolean = this.series.chart.tooltip.shared === true;
                            const param = isShared ? [this] : this;

                           //this.setState(['hover']);
                           this.series.chart.tooltip.refresh(param);

                        },
                        dblclick: function (event) {
                            const chart = this;
                            that.processDrillDown(chart);
                        },
                        // mouseOut: function(event) {
                        //     this.series.chart.tooltip.hide(this);
                        // },
                    }
                }
            });
        }
        //- end of drilldown mobile code
        else{
        this.chart.options.plotOptions.series = Object.assign(this.chart.options.plotOptions.series, {
            point: {
                events: {
                    click: function (event) {
                        
                        const chart = this; 
                        that.processDrillDown(chart)

                    }
                }
            }

        });
    }

    }


    processDrillDown(chart): void{
        const that = this;
        
        if (that._drillDownSvc.getFrequencyType(chart.category) && !chart.series.userOptions.targetId) {

            const isYear: boolean = moment(chart.category, 'YYYY', true).isValid();
            const checkYear = isYear ? chart.category : null;
            const year = that.currentNode.year || checkYear;
            const dateRange = that._drillDownSvc.getDateRangeForDrillDown(that.currentNode);
            const customDateRange = that._drillDownSvc.getDrillDownDateRange(
                chart.category, dateRange, year, that.chartData.frequency
            );

            const comparisonForDrillDown: string[] = that._drillDownSvc.getComparisonForDrillDown(
                that.comparisonValue, that.currentNode.dateRange
            );
            let frequency = that._drillDownSvc.getFrequencyType(chart.category);
            frequency = frequency ? (frequency === 'quarterly' ? 'monthly' : frequency) : null;
            const chartQueryVariables = {
                id: that.chartData._id,
                input: {
                    dateRange: customDateRange,
                    groupings: that.isDataOnFly ? that.groupingsToUpdate || null : (<any>that.chartData).groupings || null,
                    frequency: frequency,
                    xAxisSource: '',
                    isDrillDown: true,
                    comparison: comparisonForDrillDown,
                    originalFrequency: that.currentNode.frequency
                }
            };

            that._subscription.push(that._apollo.watchQuery({
                query: ChartQuery,
                fetchPolicy: 'network-only',
                variables: chartQueryVariables
            }).valueChanges.subscribe(({
                data
            }) => {
                const rawChart: ChartData = JSON.parse((<any>data).chart);
                // show message when the chart has no data
                if (rawChart.chartDefinition) {
                    const noData = that._noChartDataMessage(rawChart.chartDefinition.series);
                    if (noData) {
                        return;
                    }
                }

                that.chart = null;
                let definition = that._processChartTooltipFormatter(rawChart.chartDefinition);
                yAxisFormatterProcess(definition);
                definition = that._processPieChartPercent(rawChart.chartDefinition);
                rawChart.chartDefinition = definition;
                rawChart.chartDefinition.chart.zoomType = 'x';
                that.chart = new Chart(rawChart.chartDefinition);
                that._updateChartInfoFromDefinition();

                that.chart.options.exporting = {
                    enabled: false,
                    filename: that.title
                };

                that.enableDrillDown();

                const nodeId = that._nonce();

                const newNode: IChartTreeNode = {
                    id: nodeId,
                    parent: that.currentNode,
                    children: [],
                    definition: rawChart.chartDefinition,
                    title: that.title,
                    targetList: [],
                    rootChart: false,
                    year: checkYear,
                    dateRange: rawChart.dateRange,
                    groupings: rawChart.groupings,
                    frequency: rawChart.frequency,
                    isDataOnFly: that.currentNode.isDataOnFly,
                    isDrillDown: true,
                    isCompared: false,
                    comparison: rawChart.comparison
                };

                let found = false;

                that.currentNode.children = that.currentNode.children.filter(c => {
                    if (c.id === newNode.id) {
                        c = newNode;
                        found = true;
                    }
                    return c;
                });

                if (!found) {
                    that.currentNode.children.push(newNode);
                }

                that.currentNode = newNode;
            }));

        }
    }

    actionClicked(item) {
        this.actionItemsTarget = item.id;
        this._tableModeService.setChart(this.chart);
        this._tableModeService.setTableModeData(
            Object.assign({},
            pick(this.chartData, ['frequency', 'groupings']))
        );
        switch (item.id) {
            case 'comparison':
                return this._handleComparisonAction(item);
            case 'toggle-description':
                this._resetOverlayStyle();
                if (this.showDescription) {
                    this.descriptionAnimation = 'fadeOut';
                    setTimeout(() => this.showDescription = false, 1000);
                } else {
                    this.getComparisonDateRange()
                    this.showDescription = true;
                    this.descriptionAnimation = 'fadeIn';
                }
                break;

            case 'maximize':
                this._resetOverlayStyle();
                this.maximized = !this.maximized;
                this._redrawChart();
                break;

            case 'set-target':
                this.targetsVisible = true;
                break;

            case 'edit-chart-format':
                this._resetOverlayStyle();
                this.overlay.toggle();
                break;

            case 'edit-chart':
                this.editChartId.emit(this.chartData._id);
                break;

            case 'table-mode':
                if (!this.chartData.chartDefinition.series.length) { return; }
                this.overlay.backgroundColor = '';
                this.overlay.opacity = 1;
                this.overlay.toggle();
                break;

            case 'change-settings-on-fly':
                this._resetOverlayStyle();
                this.overlay.backgroundColor = 'white';
                this.overlay.toggle();
                break;

            case 'refresh':
                this._resetOverlayStyle();
                this.getChart();
                this.subscribeToChartUpdates();
                break;

            case 'run-rate':
                this.getDataRunRate();
                break;

            case 'download-chart':
                this._resetOverlayStyle();
                this.overlay.toggle();
                break;

            case 'remove-this-dashboard':
                const that = this;

                return SweetAlert({
                    titleText: 'Are you sure you want to remove this chart from this dashboard?',
                    text: `Remember that you can always put it back either from the chart 
                            edit screen or from de dashboard edit screen.`,
                    type: 'warning',
                    width: '600px',
                    showConfirmButton: true,
                    showCancelButton: true
                })
                .then((res) => {
                    if (res.value === true) {
                        this.chartSelectedDashId.emit({ idDashboard: this.dashBoardId, idChart: this.chartData._id } );
                    }
                });

            default:
                return;

        }
    }

    onCloseTargets(event): void {
        // if (event['click'] === 'cancel') {
        this.targetsVisible = false;
        // }

        // const refresh = {
        //     refresh: true,
        // };
        // this.targetOverlay(refresh);
        this.closeRunRate();
    }


    AnalizeFrequency() {
        switch (this.chartData.frequency) {
            case frequencyEnum.Weekly:
                this.frequencyName = 'week';
                this.neededFrequency = 12;
                this.previousfreq = Number.parseInt(moment().subtract(1, 'week').format('W'));
                this.totalFrequency = 52;
                break;
            case frequencyEnum.Monthly:
                this.frequencyName = 'month';
                this.neededFrequency = 3;
                this.previousfreq = Number.parseInt(moment().subtract(1, 'month').format('M'));
                this.totalFrequency = 12;
                break;
            case frequencyEnum.Quartely:
                this.frequencyName = 'quarter';
                this.neededFrequency = 1;
                this.previousfreq = Number.parseInt(moment().subtract(1, 'quarter').format('Q'));
                this.totalFrequency = 4;
                break;
        }
    }

    async getDataRunRate() {
        if (this.enableRunRate) { return; }
        this.enableRunRate = true;
        if (this.chartData.chartDefinition.plotOptions.column) {
            this.isStack = this.chartData.chartDefinition.plotOptions.column.stacking ? true : false;
        } else if (this.chartData.chartDefinition.plotOptions.bar) {
            this.isStack = this.chartData.chartDefinition.plotOptions.bar.stacking ? true : false;
        }
        let series =  this.chartData.chartDefinition.series;

        if (this.isTargets) {
            series = series.filter(t => !t.type);
        }

        if (this.isComparison) {
            series = series.filter(s => s.stack === 'main');
        }
        if (this.neededFrequency > this.previousfreq) {
            // Must run the query changing
            // dateRange from, looking neededFrequency periods back in time
            this.vm.seriesBack = await this.getChartValuesBackinTime();
        }
        // Calculate Run Rate
        this.calculateRunRate(series, this.vm.seriesBack);
        // Add the Series
        this.AddSeriesRunRate(this.runrateValues);
        // Refresh the chart
        this.processChartUpdate(JSON.stringify(this.chartData));
    }

    calculateRunRate(series: any[], seriesBack: any[]) {
        let total = 0;
        let totalBack = 0;
        let  avgValue = 0;
        this.totalrunrateValues = 0;
        this.runrateValues = [];
        let freqbackCount = 0
        if (!this._hasGrouping()) {
            // calculate simple AVG
            for(let i = 0; i < this.previousfreq; i++) {
                if (isNumber(series[0].data[i])) {
                    total += series[0].data[i];
                }
            }
            if (seriesBack) {
                seriesBack[0].data.map(d => {
                    if (isNumber(d)) {
                        freqbackCount += 1;
                        totalBack += d;
                    }
                });
            }
            avgValue = (total + totalBack) / (this.previousfreq + freqbackCount);
            this.runrateValues.push({
                name: series[0].name,
                colorIndex: series[0]._colorIndex,
                data: avgValue
            });
            this.totalrunrateValues += avgValue;
        } else {
            // calculate AVG by serie
            series.forEach(s => {
                total = 0;
                totalBack = 0;
                freqbackCount = 0;
                for(let i = 0; i < this.previousfreq; i++) {
                    if (isNumber(s.data[i])) {
                        total += s.data[i];
                    }
                }
                if (seriesBack) {
                    const seriesFilt = seriesBack.filter(sf => sf.name === s.name);
                    seriesFilt.map(fs => {
                        fs.data.map(d =>{
                            if (isNumber(d)) {
                                freqbackCount += 1;
                                totalBack += d;
                            }
                        });
                    });
                }
                avgValue = (total + totalBack) / (this.previousfreq + freqbackCount);
                this.runrateValues.push({
                    name: s.name,
                    colorIndex: s._colorIndex,
                    data: avgValue
                });
                this.totalrunrateValues += avgValue;
            });
            this.vm.runRateList = this.runrateValues;
        }
    }

    AddSeriesRunRate(runRateData: IRunRate[]) {

        if (!this.chartData.groupings || (this.chartData.groupings && this.isStack)) {
            let totaldata = 0;
            runRateData.map(rr => {
                totaldata += rr.data;
            });
            const dataTMP = [];
            for (let t = 0; t < this.previousfreq; t++) {
                dataTMP.push(null);
            }
            for (let t = this.previousfreq ; t <= this.totalFrequency - 1; t++) {
                dataTMP.push(totaldata);
            }
            const newSerie = {
                name: 'estimated',
                data: dataTMP,
                type: 'spline',
                color: !this.chartData.groupings ? 'black' : predefinedColors[4].colors[6],
                marker: {
                    lineWidth: 2,
                    lineColor: predefinedColors[4].colors[6],
                    fillColor: 'white'
                },
                zoneAxis: 'x',
                zones: [{value: 4}, {dashStyle: 'shortDash'}]
            };
            this.chartData.chartDefinition.series.push(newSerie);
        } else {
            runRateData.forEach(rr => {
                const dataTMP = [];
                for (let t = 0; t < this.previousfreq; t++) {
                    dataTMP.push(null);
                }
                for (let t = this.previousfreq ; t <= this.totalFrequency - 1; t++) {
                    dataTMP.push(rr.data);
                }
                const newSerie = {
                    name: 'estimated for ' + rr.name,
                    data: dataTMP,
                    type: 'spline',
                    _colorIndex: rr.colorIndex,
                    zoneAxis: 'x',
                    zones: [{value: 4}, {dashStyle: 'shortDash'}]
                };
                this.chartData.chartDefinition.series.push(newSerie);
            });
        }
    }

    getChartValuesBackinTime(): Promise<Object[]> {
        const that = this;
        const freqback: number = this.neededFrequency;
        const dateRangeNew = {
          from: moment().subtract(<any>freqback, this.frequencyName).startOf(<any>this.frequencyName).toDate(),
          to: moment().subtract(<any>freqback, this.frequencyName).endOf('year').toDate()
        };
        const dataInput = {
          dateRange: [{
              predefined: 'custom',
              custom: dateRangeNew
          }],
          groupings: this.chartData.groupings,
          comparison: this.chartData.comparison,
          frequency: this.chartData.frequency,
          isDrillDown: false
        };
        return new Promise((resolve, reject) => {
            this._apolloService.networkQuery<ChartResponse>(ChartQuery, { id: that.chartData._id, input: dataInput })
            .then(data => {
                const chartResponse = JSON.parse(data.chart);
                let seriesBack = chartResponse.chartDefinition.series;
                seriesBack = seriesBack.filter(t => !t.type);
                resolve(seriesBack);
            });
        });
    }

    closeDescription() {
        this.showDescription = false;
    }

    closeOverlay(result: DialogResult) {
        // this.isSettingsOnFly = !this.isSettingsOnFly;
        // this._isSettingsOnFly();
        this.actionItemsTarget = undefined;
        this.overlay.hide();
        this._refreshTarget(result);
    }

    targetOverlay(options: any) {
        this.actionItemsTarget = undefined;
        setTimeout(() => {
            if (options.refresh) {
                this.subscribeToChartUpdates();
            }
        }, 100);
    }

    drillup() {
        const that = this;
        if (this.currentNode.parent) {
            this.title = this.currentNode.parent.title;
            this.chartData.targetList = this.currentNode.parent.targetList;
            this.chartData.dateRange = this.currentNode.parent.dateRange;
            this.chartData.groupings = this.currentNode.parent.groupings;
            this.chartData.frequency = this.currentNode.parent.frequency;
            this.chartData.comparison = this.currentNode.parent.comparison;

            this.chart = new Chart(this.currentNode.parent.definition);
            this._tableModeService.setChart(this.chart);
            this._tableModeService.setTableModeData(
                Object.assign({},
                pick(this.chartData, ['frequency', 'groupings']))
            );

            this.drillUpAnimation = 'fadeOutLeft';
            if (!this.currentNode.parent.isCompared) {
                that.comparisonValue = [];
            } else {
                that.getComparisonValue();
            }
            setTimeout(function () {
                that.chartData.targetList = that.currentNode.parent.targetList;
                that.currentNode = that.currentNode.parent;
                that.drillUpAnimation = 'fadeInLeft';
            }, 500);
        }
        this._updateComparisonOptions();
        this.getComparisonDateRange();
    }

    showFutureTargets() {
        const that = this;
        const chartQueryVariables = {
            id: this.chartData._id,
            input: {
                dateRange: [{
                    predefined: null,
                    custom: {}
                }],
                groupings: (<any>this.chartData).groupings || null,
                // FIX HERE
                frequency: (<any>this.chartData).frequency,
                isDrillDown: false,
                isFutureTarget: true
            }
        };
        that._subscription.push(this._apollo.watchQuery({
            query: ChartQuery,
            fetchPolicy: 'network-only',
            variables: chartQueryVariables
        }).valueChanges.subscribe(({
            data
        }) => {
            const rawChart: ChartData = JSON.parse((<any>data).chart);
            let definition = this._processChartTooltipFormatter(rawChart.chartDefinition);
            yAxisFormatterProcess(definition);
            definition = this._processPieChartPercent(rawChart.chartDefinition);
            rawChart.chartDefinition = definition;

            this._updateChartInfoFromDefinition();
            this.chart = new Chart(rawChart.chartDefinition);

            this.chart.options.exporting = {
                enabled: false,
                filename: this.title
            };
        }));
    }

    getChart() {
        const that = this;

        that.chartSubscription = this._apollo.watchQuery<ChartResponse>({
            query: ChartQuery,
            variables: {
                id: this.chartData._id,
                input: {
                    dateRange: [{
                        predefined: (<any>this.chartData).dateRange[0].predefined,
                        custom: (<any>this.chartData).dateRange[0].custom || null
                    }],
                    groupings: (<any>this.chartData).groupings,
                    frequency: (<any>this.chartData).frequency,
                    isDrillDown: false
                }
            },
            fetchPolicy: 'network-only'
        });
    }

    subscribeToChartUpdates() {
        const that = this;
        this._subscription.push(
            this.chartSubscription.valueChanges.subscribe(({
            data
        }) => {
            that.processChartUpdate(data.chart);
        }));
    }

    processChartUpdate(chart: string): void {

        const rawChart: ChartData = JSON.parse(chart);
        this.chartData = rawChart;

        let definition = this._processChartTooltipFormatter(rawChart.chartDefinition);
        definition = this._processPieChartPercent(rawChart.chartDefinition);
        yAxisFormatterProcess(definition);
        rawChart.chartDefinition = definition;
        rawChart.chartDefinition.chart.zoomType = 'x';

        this.chart = new Chart(rawChart.chartDefinition);
        this.chart.options.exporting = {
            enabled: false,
            filename: this.title
        };

        this._updateChartInfoFromDefinition();

        this.hasFutureTargets = this._checkFutureTarget(this.chartData) !== undefined;

        this.processChartNode(rawChart, this.chart, this.chartData);
        if (this.chartData && rawChart && rawChart.targetList) {
            this.chartData.targetList = rawChart.targetList;
        }
        this.enableDrillDown();
        this.chartIsEmpty();
    }

    processChartNode(rawChart: ChartData, chart: any, chartData: ChartData): void {
        if (this.isDataOnFly) {
            const nodeId = this._nonce();

            const newNode: IChartTreeNode = {
                id: nodeId,
                parent: this.currentNode,
                children: [],
                definition: rawChart.chartDefinition,
                title: this.title,
                targetList: [],
                rootChart: false,
                dateRange: rawChart.dateRange,
                groupings: rawChart.groupings,
                frequency: rawChart.frequency,
                isDataOnFly: this.isDataOnFly,
                isDrillDown: false,
                isCompared: false,
                comparison: rawChart.comparison
            };

            let found = false;

            if (this.currentNode && this.currentNode.children) {
                this.currentNode.children = this.currentNode.children.filter(c => {
                    if (c.id === newNode.id) {
                        c = newNode;
                        found = true;
                    }
                    return c;
                });

                if (!found) {
                    this.currentNode.children.push(newNode);
                }
            }

            this.currentNode = newNode;
            return;
        }

        this.rootNode = {
            id: null,
            parent: null,
            children: [],
            definition: chart.options,
            title: this.title,
            targetList: chartData.targetList,
            rootChart: true,
            dateRange: rawChart.dateRange,
            groupings: rawChart.groupings,
            frequency: rawChart.frequency,
            isDataOnFly: this.isDataOnFly,
            isDrillDown: false,
            isCompared: false,
            comparison: rawChart.comparison
        };

        this.currentNode = this.rootNode;
    }

    getDateRange(custom: any) {
        if (custom.from && custom.to) {
            this.from = custom.from;
            this.to = custom.to;
        }
    }

    getFilterData() {
        this.chartData.kpis.map(kpi => {
            let filter = kpi.filter;
            const operators: string[] = ['__dollar__and', '__dollar__or', '__dollar__not', '__dollar__nor'];

            if (filter) {
                Object.keys(filter).forEach(key => {
                    if (operators.indexOf(key) !== -1) {
                        filter = filter[key];
                    } else {
                        filter = [filter];
                    }
                });
            }

            this.filterData = filter;
        });
    }

    chartIsEmpty(): boolean {
        const value =_get(this.chartData, 'chartDefinition.series', 0) === 0;
        return value;
    }

    get drilledDown(): boolean {
        if (!this.currentNode) {
            return false;
        }
        return !this.currentNode.rootChart &&
              this.isDrillDownAvailable() &&
               !this.chartData.futureTarget;
    }

    get tableMode() {
        return this.actionItemsTarget === 'table-mode';
    }

    get downLoadChart() {
        return this.actionItemsTarget === 'download-chart';
    }

    get changeSettingsOnFly() {
        return this.actionItemsTarget === 'change-settings-on-fly';
    }

    get editChartFormat() {
        return this.actionItemsTarget === 'edit-chart-format';
    }

    get chartDataSeriesExist(): boolean {
        return this.chartData &&
               this.chartData.chartDefinition &&
               Array.isArray(this.chartData.chartDefinition.series);
    }

    get futureTargetShow() {
        return !this.chartData.futureTarget &&
                this.hasFutureTargets &&
                this.chartData.targetList.length &&
                this.chartData.frequency !== 'yearly';
    }

    get noChartData() {
        return this.chartDataSeriesExist && this.chartData.chartDefinition.series.length === 0;
    }

    get chartMaximized() {
        return this.chartDataSeriesExist && this.chartData.chartDefinition.series.length > 0;
    }

    get setGoal() {
        if (!this.chartData || !Array.isArray(this.chartData.targetList)) {
            return false;
        }

        if (this.chartData.targetList.length && !this.vm.authorizedTo('ViewTargetActivity')) {
            return false;
        }
        if (!this.chartData.targetList.length && !this.vm.authorizedTo('AddTargetActivity')) {
            return false;
        }
        return this.actionItemsTarget === 'set-target' && (<any>this.chartData).canAddTarget;
    }

    // property methods
    get createTarget() {
        return this.vm.authorizedTo('AddTargetActivity');
    }

    get hasCustomDateRange(): boolean {
        return this.chartData &&
               Array.isArray(this.chartData.dateRange) &&
               this.chartData.dateRange.length &&
               this.chartData.dateRange[0].custom;
    }

    get hasKpiFilter(): boolean {
        return this.chartData &&
               Array.isArray(this.chartData.kpis) &&
               this.chartData.kpis.length &&
               this.chartData.kpis[0].filter;
    }

    get hasKpiExpression(): boolean {
        return this.chartData &&
               Array.isArray(this.chartData.kpis) &&
               this.chartData.kpis.length &&
               this.chartData.kpis[0].expression;
    }

    get chartDefinitionChartTypeExist(): boolean {
        return (this.chartData &&
               this.chartData.chartDefinition &&
               this.chartData.chartDefinition.chart) ? true : false;
    }

    isSettingsOnFly() {
        return   this.currentNode && this.currentNode.isDataOnFly && !this.drilledDown;
    }

    private _updateChartInfoFromDefinition() {
        // move title to car header
        this.title = this.chart.options.title.text ? this.chart.options.title.text : this.chartData.title;
        this.chart.options.title = { 'text': undefined };

        // getting the subtitle for the info overlay
        this.description = this.chart.options.subtitle.text ? this.chart.options.subtitle.text : this.chartData.subtitle;
        this.chart.options.subtitle = { 'text': undefined };

        // setting all Y values to 2 decimal paleces
        this.chartData.chartDefinition.tooltip = this.chartData.chartDefinition.tooltip || {};
        this.chartData.chartDefinition.tooltip.valueDecimals = 2;

        // setting the credits at the bottom right
        this.chartData.chartDefinition.credits = {
            enabled: false,
            href: 'http://www.atlaskpi.com',
            text: 'Powered by AtlasKPI'
        };
    }

    // private methods
    private _processChartYAxisFormatterFunctions(definition: any) {
        if (definition.yAxis && definition.yAxis.labels && definition.yAxis.labels.formatter) {
            const formatterFactory = new FormatterFactory();
            definition.yAxis.labels.formatter = formatterFactory.getFormatter(definition.yAxis.labels.formatter).exec;
        }

        return definition;
    }

    private _processChartTooltipFormatter(definition: any, stack?: string) {
        if (definition.tooltip && definition.tooltip.formatter) {
            const formatterFactory = new FormatterFactory();
            definition.tooltip.formatter = formatterFactory.getFormatter(definition.tooltip.formatter, stack).exec;
        } else {
            var targetExists = null;
            if(definition.series == !undefined) {
                targetExists =  definition.series.find(s => s.targetId);
            }

            if (definition.tooltip && definition.tooltip.altas_definition_id === 'default' && targetExists) {
                const formatterFactory = new FormatterFactory();
                const formatter = formatterFactory.getFormatter('percentage_target_default').exec;
                definition.tooltip.pointFormatter = formatter;
            }
        }

        return definition;
    }

    private _processPieChartPercent(definition: any) {
        //  if (definition.plotOptions && definition.plotOptions.pie) {
        //   const formatterFactory = new FormatterFactory();
        //   definition.plotOptions.pie.dataLabels.formatter =
        //     formatterFactory.getFormatter(definition.plotOptions.pie.dataLabels.formatter).exec;
        // }
        return definition;
    }

    private _redrawChart() {
        const that = this;
        const currentChart = this.chart;
        this.chart = null;

        setTimeout(() => {
            that.chart = currentChart;
        }, 100);
    }

    private _resetOverlayStyle() {
        if (this.overlay.backgroundColor !== '#05050c' && this.overlay.opacity !== 0.8) {
            this.overlay.backgroundColor = '#05050c';
            this.overlay.opacity = 0.8;
        }
    }

    private _nonce() {
        const arr = [];

        for (let i = 0; i < 5; i++) {
            arr.push(String.fromCharCode(Math.floor((Math.random() * 26) + 65)));
            arr.push(String.fromCharCode(Math.floor((Math.random() * 12) + 48)));
            arr.push(String.fromCharCode(Math.floor((Math.random() * 26) + 97)));
        }
        return arr.join('');
    }

    private _getStackCategories(definition: any, chartData: any) {
        const groupings = chartData.groupings;

        let nonStackCategories;

        if (!groupings || !groupings.length || !groupings[0]) {
            nonStackCategories = [{
                id: chartData.title,
                title: chartData.title,
                selected: false,
                disabled: false
            }];
            return;
        }
        let categories = this._isStacked(groupings, chartData) ?
            definition.xAxis.categories.map((val) => {
                return {
                    id: val,
                    title: val,
                    selected: false,
                    disabled: false
                };
            }).filter(item => item.title !== 'Others') : [];

        if (!this._isStacked(groupings, chartData)) {
            const filterCategories = definition.series.filter(serie => {
                if (!serie.targetId) {
                    return serie;
                }
            });
            nonStackCategories = filterCategories.map((serie) => {
                return {
                    id: serie.name.replace(/,/g, ''),
                    title: serie.name,
                    selected: false,
                    disabled: false
                };
            }).filter(item => item.title !== 'Others');
            nonStackCategories.unshift({
                id: 'all',
                title: 'All',
                selected: false,
                disabled: true
            });
        }

        if (this.chartData && this.chartData.comparison && this.chartData.comparison.length) {
            const comparisonString = PredefinedDateRanges[this.chartData.comparison[0]];

            if (categories.length) {
                categories = categories.filter(c => c.title.indexOf(`(${comparisonString})`) === -1);
            }

            if (nonStackCategories.length) {
                nonStackCategories = nonStackCategories.filter(c => c.title.indexOf(`(${comparisonString})`) === -1);
            }
        }

    }

    private _isStacked(groupings: string[], chartData: any) {
        return  ((chartData.chartDefinition.chart.type === 'column') &&
            ((<any>chartData).groupings[0] === (<any>chartData).xAxisSource)) ||
            (groupings.length && !chartData.frequency && !chartData.xAxisSource);
    }

    private _refreshTarget(result: DialogResult) {
        const that = this;

        setTimeout(() => {
            if (result === 0) {
                that.subscribeToChartUpdates();
            }
        }, 1000);
    }

    private _checkFutureTarget(chartData: any) {
        if (!Array.isArray(chartData.targetList)) {
            return undefined;
        }
        return chartData.targetList.find(target => {
            const endDate = moment().endOf('year').toDate();
            return moment(target.datepicker).isAfter(endDate);
        });
    }

    private _updateComparisonOptions(options?: {
        disabled?: boolean,
    }) {
        /**
         * this is being called inside a setTimeout
         * when navigating dashboards, this.chartData would be a null value
         */
        if (this.chartData) {
            const dateRangeString = this.chartData.dateRange[0].predefined || 'custom';
            const dateRange = this.dateRanges.find(d => d.dateRange.predefined === dateRangeString);
            const compareAction = this.compareActions.find(action => action.id === 'comparison');
            const emptyChildrens = undefined;

            if (!dateRange ||
                (options && options.disabled) ||
                (this.chartDefinitionChartTypeExist && this.chartData.chartDefinition.chart.type === 'pie')) {
                if (compareAction) {
                    compareAction.children = emptyChildrens;
                }
                return;
            }
            const kpi_id = this.chartData.kpis[0]._id;
            this._apolloService.networkQuery < string > (kpiOldestDateQuery, {id: kpi_id })
            .then(kpis => {
                compareAction.children = this.updateComparisonData(dateRange , kpis.getKpiOldestDate);
                this.loadedComparisonData = true;
            });
        }
    }
    private updateComparisonData(dateRange: any, yearOldestDate: string): any[] {
        const itemsComparison = [dateRange, ''];
        const childrens = [];
        dateRange.comparisonItems.map(item => {
            itemsComparison[1] = item.key;
            const yearofDateFrom = parseComparisonDateRange(<any>itemsComparison, itemsComparison[0]).from.getFullYear();
            if (yearofDateFrom >= parseInt(yearOldestDate, 0)) {
                childrens.push({
                    id: 'comparison',
                    title: item.value,
                    payload: item.key
                });
            }
        });
        return childrens.length > 0 ? childrens : undefined;
    }

    private _handleComparisonAction(item: any) {
        if (!item || !item.payload) {
            return;
        }
        const that = this;
        const variables = {
            id: this.chartData._id,
            input: {
                dateRange: pick(that.chartData.dateRange[0], ['predefined', 'custom']),
                groupings: (<any>this.chartData).groupings || null,
                frequency: (<any>this.chartData).frequency,
                comparison: [item.payload]
            }
        };
        this._apollo.query({
            query: ChartQuery,
            variables: variables,
            fetchPolicy: 'network-only'
        })
            .toPromise()
            .then(({
                data
            }) => {
                that.chart = null;
                const rawChart: ChartData = JSON.parse((<any>data).chart);
                let definition = that._processChartTooltipFormatter(rawChart.chartDefinition, 'Difference');
                yAxisFormatterProcess(definition);
                definition = that._processPieChartPercent(rawChart.chartDefinition);
                rawChart.chartDefinition = definition;
                that.chart = new Chart(rawChart.chartDefinition);

                that.chartData = rawChart;

                that._updateChartInfoFromDefinition();
                that.getComparisonValue();
                that.enableDrillDown();

                that._updateComparisonOptions({
                    disabled: true
                });

                that.chart.options.exporting = {
                    enabled: false,
                    filename: that.title
                };

                const nodeId = that._nonce();

                const newNode: IChartTreeNode = {
                    id: nodeId,
                    parent: that.currentNode,
                    children: [],
                    definition: rawChart.chartDefinition,
                    title: that.title,
                    targetList: [],
                    rootChart: false,
                    dateRange: rawChart.dateRange,
                    groupings: rawChart.groupings,
                    frequency: rawChart.frequency,
                    isDataOnFly: false,
                    isDrillDown: false,
                    isCompared: true,
                    comparison: rawChart.comparison
                };

                that.currentNode.children.push(newNode);
                that.currentNode = newNode;
            });
    }

    private _disableCompareActionItems(compareAction: MenuItem[]) {
        if (!compareAction.length) { return; }
        const check = ['comparison'];
        if (!this._hasSeries() ||
            this.chart.options.chart.type.toLowerCase() === 'pie' ||
            this._isComparsion() ||
            this._isDateRangeAllTimes()) {
            compareAction.forEach(comparison => {
                if (check.indexOf(comparison.id) !== -1) {
                    comparison.disabled = true;
                }
            });
        }
    }

    private _disableTargetOption(): void {
        if (!this._hasSeries() || this._hasDaily() || this._isChartTypePie() || this._isDateRangeInPast() || this._isAllTimesNotYearly()) {
            this._commonService.disableChildrenActionItems(this.actionItems, ['set-target']);
        } else if (!this.createTarget) {
            this._commonService.disableChildrenActionItems(this.actionItems, ['set-target'], !this.createTarget);
        }
    }

    private _isComparsion(): boolean {
        return Array.isArray(this.chartData.comparison) && this.chartData.comparison.length > 0;
    }

    private _isDateRangeAllTimes(): boolean {
        if (isEmpty(this.chartData.dateRange)) {
            return false;
        }

        const isAllTimes = this.chartData.dateRange.find(d => d.predefined === PredefinedDateRanges.allTimes);
        return isAllTimes ? true : false;
    }

    private _isChartTypePie(): boolean {
        return this.chart.options.chart.type === 'pie';
    }

    private _hasSeries(): boolean {
        return (this.chart.options.series || []).length > 0;
    }

    private _hasDaily(): boolean {
        return this.chartData.frequency === 'daily';
    }

    private _isAllTimesNotYearly(): boolean {
        return this.chartData.dateRange[0].predefined === 'all times'
            && (this.chartData.frequency !== 'yearly' || (this.chartData.xAxisSource !== 'frequency' && this.chartData.xAxisSource !== ''));
    }

    private _hasFrequency(): boolean {
        return this.chartData.frequency ? true : false;
    }

    private _hasGrouping(): boolean {
        const groupings: string[] = (this.chartData as any).groupings;
        return (!isEmpty(groupings) && groupings[0]) ? true : false;
    }

    private _isDateRangeInPast(): boolean {
        const checkForLast: RegExp = /last/;
        const predefined = this.chartData.dateRange.find(d => checkForLast.test(d.predefined));

        const checkForCustom: RegExp = /custom/;
        const customDateRange = this.chartData.dateRange.find(d => checkForCustom.test(d.predefined));

        if (customDateRange) {
            const customTo = moment(customDateRange.custom.to);
            if (moment().isAfter(customTo)) {
                return true;
            }
        }

        return predefined ? true : false;
    }

    private _noChartDataMessage(series: any[]): boolean {
        if (!series || !series.length) {
            SweetAlert({
                type: 'info',
                title: 'DrillDown',
                text: 'There is no data. Choose a different series.'
            });
            return true;
        }
        return false;
    }

    private _targetNotAuthorizedMessage() {
        if (this.chartData.targetList.length && !this.vm.authorizedTo('ViewTargetActivity')) {
            SweetAlert({
                title: 'Target Authorization',
                text: 'Not authorized to view targets',
                type: 'warning'
            });
            return;
        }
        if (!this.chartData.targetList.length && !this.vm.authorizedTo('AddTargetActivity')) {
            SweetAlert({
                title: 'TargetAuthorization',
                text: 'Not authorized to add target',
                type: 'warning'
            });
            return;
        }
    }

    private _disableMenuItem(): void {
        this._commonService.disableActionItems(
            this.compareActions,
            ['comparison'],
            !this.vm.authorizedTo('CompareOnFlyActivity')
        );
        this._commonService.disableChildrenActionItems(
            this.actionItems, ['change-settings-on-fly'],
            !this.vm.authorizedTo('ChangeSettingsOnFlyActivity')
        );

        this._commonService.disableChildrenActionItems(
            this.actionItems, ['download-chart'],
            !this.vm.authorizedTo('DownloadChartActivity')
        );

        this._commonService.disableChildrenActionItems(
            this.actionItems, ['toggle-description'],
            !this.vm.authorizedTo('SeeInfoActivity')
        );
    }
}

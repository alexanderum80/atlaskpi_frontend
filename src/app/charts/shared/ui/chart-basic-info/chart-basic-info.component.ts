import { IChartGalleryItem, ChartType } from './../../models/chart.models';

import { OnFieldChanges } from '../../../../ng-material-components/viewModels';
import 'rxjs/add/operator/debounceTime';

import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild, OnChanges, ElementRef, Renderer } from '@angular/core';
import { FormControl, FormGroup, FormArray, Validators, FormBuilder } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { camelCase, title } from 'change-case';
import { clone, find, isEmpty, isEqual, toArray } from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import {
    Promise
} from 'bluebird';

import { SelectionItem } from '../../../../ng-material-components';
import {
    IDatePickerConfig,
} from '../../../../ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';
import {
    SelectPickerComponent,
} from '../../../../ng-material-components/modules/forms/select-picker/select-picker.component';
import { IKPI } from '../../../../shared/domain/kpis/kpi';
import { IsNullOrWhiteSpace, ToSelectionItemList } from '../../../../shared/extentions';
import { PredefinedDateRanges } from '../../../../shared/models';
import { FrequencyTable } from '../../../../shared/models/frequency';
import { PredefinedTopNRecords } from '../../../../shared/models/top-n-records';
import { BrowserService } from '../../../../shared/services/browser.service';
import { CommonService } from '../../../../shared/services/common.service';
import { ChartModel } from '../../models';
import { IChart } from '../../models/chart.models';
import { ChartGalleryService } from '../../services/';
import { IDateRangeItem, parseComparisonDateRange, IChartDateRange } from './../../../../shared/models/date-range';
import { ApolloService } from './../../../../shared/services/apollo.service';
import { chartsGraphqlActions } from './../../graphql/charts.graphql-actions';
import { ChartBasicInfoViewModel } from './chart-basic-info.viewmodel';
import { startWith } from 'rxjs/operators';


const kpiOldestDateQuery = require('graphql-tag/loader!./kpi-get-oldestDate.gql');
const kpiDataSourcesQuery = require('graphql-tag/loader!./kpi-get-DataSources.gql');

export const RevenueGroupingList: SelectionItem[] = [
    { id: 'location', title: 'Location', selected: false, disabled: false },
    { id: 'product', title: 'Product', selected: false, disabled: false },
    { id: 'businessUnit', title: 'Business Unit', selected: false, disabled: false },
    { id: 'serviceType', title: 'Service Type', selected: false, disabled: false },
    { id: 'provider', title: 'Provider', selected: false, disabled: false },
    { id: 'customerState', title: 'Customer\'s STATE', selected: false, disabled: false},
    { id: 'customerCity', title: 'Customer\'s CITY', selected: false, disabled: false},
    { id: 'customerZip', title: 'Customer\'s ZIP', selected: false, disabled: false},
    { id: 'customerGender', title: 'Customer\'s GENDER', selected: false, disabled: false}
];

const ExpensesGroupingList = [
    { id: 'location', title: 'location', selected: false, disabled: false },
    { id: 'businessUnit', title: 'businessUnit', selected: false, disabled: false },
    { id: 'concept', title: 'concept', selected: false, disabled: false }
];

const kpiGroupingsQuery = require('graphql-tag/loader!./kpi-groupings.query.gql');

@Component({
    selector: 'kpi-chart-basic-info',
    styleUrls: ['./chart-basic-info.component.scss'],
    templateUrl: 'chart-basic-info.component.pug',
    providers: [ ChartBasicInfoViewModel ]
})
export class ChartBasicInfoComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    @Input() fg: FormGroup;
    @Input() kpis: IKPI[] = [];
    @Input() chartType = 'pie';
    @Input() kpiList: SelectionItem[] = [];
    @Input() dashboardList: SelectionItem[] = [];
    @Input() isnewChartOrMap = true;
    @Input() isFromDashboard: boolean;
    sortingCriteriaList: SelectionItem[] = [];
    private sortingCriteriaList$: Observable <SelectionItem[]>;
    frequencyPicker: SelectPickerComponent;
    xSourcePicker: SelectPickerComponent;

    lastKpiDateRangePayload: any;
    lastOldestDatePayload = '';
    previousChartType = '';
    subscribedToFrequencyAndGrouping = false;
    subscribedToXaxisSource = false;
    loadingGroupings = true;
    loadingGEle : ElementRef;

    @ViewChild('frequencyPicker') set frequencyContent(content: SelectPickerComponent) {
        if (content) {
            this.frequencyPicker = content;
            if(!this.subscribedToFrequencyAndGrouping)
                this._subscribeToFrequencyAndGroupingChanges();
        }
    }
    @ViewChild('xSourcePicker') set xSourceContent(content: SelectPickerComponent) {
        if (content) {
            this.xSourcePicker = content;
            if(!this.subscribedToXaxisSource){
                this._subscribeToXAxisChanges()
            }
        }
    }

    @ViewChild('loadingG') set loadingContent(content: ElementRef){
        if(content){
            this.loadingGEle = content;
        }
    }

    datePickerConfig: IDatePickerConfig;
    dateRanges: IDateRangeItem[] = [];
    isMobile: boolean;

    dateRangeList: SelectionItem[] = [
        {
          id: 'custom',
          title: 'custom',
          selected: false,
          disabled: false
        }
    ];
    sortingOrderList: SelectionItem[] = [
        {
            id: 'ascending',
            title: 'Ascending',
            selected: false,
            disabled: false

        },
        {
            id: 'descending',
            title: 'Descending',
            selected: false,
            disabled: false

        }
    ];

    chartCombinations: (ChartType | string)[];
    comparisonList: SelectionItem[] = [];
    isCollapsedComparison = true;
    isCollapsedSorting = true;
    frequencyList: SelectionItem[] = [];
    groupingList: SelectionItem[] = [];
    zipCodeSourceList: SelectionItem[] = [];
    mapsizeList: SelectionItem[] = [
        {
            id: 'small',
            title: 'SMALL',
            selected: false,
            disabled: false
        },
        {
            id: 'big',
            title: 'BIG',
            selected: false,
            disabled: false
        }
    ];
    xAxisSourceList: SelectionItem[] = [];
    topList: SelectionItem[] = [
        { id: 'other', title: 'other', selected: false, disabled: false }
    ];

    backupChartModel: ChartModel;
    ischartTypeMap = false;

    private _subscription: Subscription[] = [];

    constructor(private _chartGalleryService: ChartGalleryService,
                private _apollo: Apollo,
                private _apolloService: ApolloService,
                private _browser: BrowserService,
                public vm: ChartBasicInfoViewModel,
                private formBuilder: FormBuilder,
                private _renderer: Renderer) {

        this._dateRangesQuery();
        toArray(PredefinedDateRanges)
         .forEach(d => { this.dateRangeList.push({ id: d, title: d, selected: false, disabled: false }); });
        toArray(Object.keys(FrequencyTable))
         .forEach(f => { this.frequencyList.push({ id: f, title: f, selected: false, disabled: false}); });
        toArray(PredefinedTopNRecords)
         .forEach(record => { this.topList.push({ id: record, title: record, selected: false, disabled: false }); });
    }

    ngOnInit() {
        this.datePickerConfig = {
            showGoToCurrent: false,
            format: 'MM/DD/YYYY'
        };

        this._loadingGroupings();
    }
    ngOnChanges() {
        if (this.chartType === 'map') {
            this.ischartTypeMap = true;
            const selectedTypeChart: IChartGalleryItem = {
                configName: 'map',
                img: '/assets/img/charts/others/map.png',
                name: 'map',
                type: 'others'
            };
            this._chartGalleryService.setActive(selectedTypeChart);
        }
    }
    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    ngAfterViewInit() {
        this._subscribeToKpiAndDateRange();
        this._subscribeToChartTypeChanges();
       // this._subscribeToXAxisChanges();
        this._subscribeToComparisonChanges();
        this._subscribeToSortCriteriaListChanges();
       // this._subscribeToFrequencyAndGroupingChanges();
        this.isMobile = this._browser.isMobile();
        this._resetCustomDateRangeControls();
        this._canShowTour();
    }

    startTour() {
        this.vm.startTour();
    }

    updateXaxisSourceList(value: string): void {

        if(this.chartType === "pie") return;

        const xAxisSelectionList = [];
        const xAxisSource = this.fg.value.xAxisSource;
        const frequency = this.fg.value.frequency;
        if (frequency && frequency.length > 0) {
            xAxisSelectionList.push({ id: 'frequency', title: 'frequency', selected: xAxisSource === 'frequency' ? true : false,
                                        disabled: false });
            setTimeout(()  => {
                if (!value) {
                    this.fg.controls['xAxisSource'].setValue('frequency');
                }
            }, 50);
        }

        if (value && value.length > 0) {
            const titleValue = camelCase(value);
            xAxisSelectionList.push({id: value, title: titleValue, selected: (!frequency)? true : false, disabled: false });
            if(!frequency){
                setTimeout(()  => {
                    //if (!xAxisSource) {
                        this.fg.controls['xAxisSource'].setValue(value);
                    //}
                }, 50);
            }
        }

        if(!xAxisSelectionList.length){
            setTimeout(()  => {
                this.fg.controls['xAxisSource'].setValue(null);
            }, 50);
        }
        this.xAxisSourceList = xAxisSelectionList;
    }

    get showCustomDateRangeControls(): boolean {
        return this.fg.value['predefinedDateRange'] === 'custom';
    }

    get showCustomTopNRecordControls(): boolean {
        return this.fg.value['predefinedTop'] === 'other';
    }

    get isPieChart(): boolean {
        return this.chartType === 'pie';
    }

    private _subscribeToKpiAndDateRange(): void {
        const that = this;
        this.fg.valueChanges
        .distinctUntilChanged()
        .debounceTime(400)
        .subscribe((value) => {
            const loadingGroupings = value.loadingGroupings || false;
            const loadingComparison = value.loadingComparison || false;
            const kpiIds = value.kpis.map(k => k.kpi) as string[];

            if (kpiIds && kpiIds.length && value.predefinedDateRange && !loadingGroupings && !loadingComparison) {
                const payload = that._getGroupingInfoInput();
                if (isEqual(that.lastKpiDateRangePayload, payload)) { return; }
                that._getGroupingInfo(value);
                that._getOldestDate(kpiIds);
                that.lastKpiDateRangePayload = payload;
            }
            // const kpi_ids = this.fg.value.kpis;
            // Enable-Disable the map type chart
            // FIX THIS
            if (kpiIds && kpiIds.filter(k => !!k).length) {
                // let resSources;
                this._getZipCodesSource(value)
                    .then(result => {
                        // if (this.zipCodeSourceList.length === 0 ) {
                        //     // this._showMapTypeChart();
                        //     return;
                        // }

                        // for (const i of this.zipCodeSourceList) {
                        //     this._apolloService.networkQuery < string > (kpiDataSourcesQuery, {ids: kpiIds, zipField: i.id})
                        //     .then(sources => {
                        //         resSources = sources.getKpiDataSources[0];
                        //         if (resSources === true) {
                        //             // that._chartGalleryService.showMap = resSources;
                        //             this.previousChartType = this.chartType;
                        //         } else {
                        //             // this._showMapTypeChart();
                        //         }
                        //     });
                        // }
                    });

                }

        });
    }

    // private _showMapTypeChart() {
    //     this._chartGalleryService.showMap = false;
    //     if (!this._chartGalleryService.showMap && this.chartType === this.previousChartType) {
    //         this.chartType = 'pie';
    //     }
    //     this.previousChartType = this.chartType;
    // }

    private _getOldestDate(kpis: string[]): void {
        this._apolloService
        .networkQuery < string > (kpiOldestDateQuery, { ids: kpis })
        .then(kpis => {
            this._updateComparisonData(kpis.getKpiOldestDate);
        });
    }

    private _getZipCodesSource(item: any): Promise<any> {
        const that = this;

        if (!item.kpis) {
             return new Promise.resolve([]);
        }

        const customDateRange = (!!item.customFrom && !!item.customTo) ? {from: item.customFrom, to: item.customTo} : null;
        const dateRangePred = (item.predefinedDateRange) ? item.predefinedDateRange : PredefinedDateRanges.allTimes;

        if (dateRangePred === 'custom' && !customDateRange) {
            return new Promise.resolve(this.zipCodeSourceList || []);
        }
        // TODO dateRange when is custom, that is hard coded at the moment
        const input = {
            ids: item.kpis.map(k => k.kpi),
            dateRange: { predefined: dateRangePred , custom: customDateRange }
        };

        return new Promise <any> ((resolve, reject) => {
            this._apolloService.networkQuery(kpiGroupingsQuery, { input })
            .then(data => {
                let zipCodeSourceList = [];
                that.zipCodeSourceList = [];
                zipCodeSourceList = data.kpiGroupings
                    .filter(d => d.name.toLowerCase().includes('zip' || 'postal'))
                    .map(d => new SelectionItem(d.value, d.name));
                    that.zipCodeSourceList = zipCodeSourceList;

                    if (data && this.ischartTypeMap === true) {
                        if (that.fg.controls['zipCodeSource'].value === '' && that.zipCodeSourceList
                        .find(d => d.id === 'customer.zip')) {
                            that.fg.controls['zipCodeSource'].patchValue('customer.zip');
                        }
                    }
                return resolve(this.zipCodeSourceList);
            });
         });
        }

    private _getGroupingInfo(item: any) { /* get groupingInfo */
        const that = this;
        this.loadingGroupings = true;
        // basic payload check
        if (!item.kpis || !item.predefinedDateRange) {
            return;
        }

        // incomplete custom dateRange
        if (item.predefinedDateRange === 'custom'
            && (!item.customFrom || !item.customTo)) {
                return;
        }

        const input = this._getGroupingInfoInput();
        this.fg.controls['loadingGroupings'].patchValue(true, { emitEvent: false });

        this._apolloService.networkQuery(kpiGroupingsQuery, { input })
            .then(data => {

                that.loadingGroupings = false;
                let groupingList = [];
                that.groupingList = [];

                if (data || !isEmpty(data.kpiGroupings)) {
                    groupingList = data.kpiGroupings.map(d => new SelectionItem(d.value, d.name));
                }
               
                that.groupingList = groupingList;
                const currentGroupingValue = this.fg.get('grouping').value || '';
                let nextGropingValue;
                if (!groupingList.map(g => g.id).includes(currentGroupingValue)) {
                    nextGropingValue = '';
                } else {
                    nextGropingValue = currentGroupingValue;
                }
                
                that.fg.controls['grouping'].patchValue(nextGropingValue, { emitEvent: false });
                that.fg.controls['loadingGroupings'].patchValue(false, { emitEvent: true });
            });
    }

    private _getGroupingInfoInput(): { ids: string[], dateRange: IChartDateRange[] } {
        const item = this.fg.value;
        const dateRange = { predefined: item.predefinedDateRange, custom: null};

        // process custom dateRange
        if (item.customFrom && item.customTo) {
            dateRange.custom = {
                from: moment(item.customFrom).format('MM/DD/YYYY'),
                to: moment(item.customTo).format('MM/DD/YYYY')
            };
        }

        return {
            ids: item.kpis.map(k => k.kpi),
            dateRange: [dateRange]
        };
    }

    private _subscribeToFrequencyAndGroupingChanges(): void {
        if (this.fg.get('grouping') && this.fg.get('frequency')) {

            this.subscribedToFrequencyAndGrouping = true;

            this._subscription.push(
                Observable.combineLatest(
                    this.fg.get('frequency').valueChanges.pipe(startWith(null)),
                    this.fg.get('grouping').valueChanges.pipe(startWith(null))
                )
                .debounceTime(300)
                .subscribe(result => {

                    const frequency: string = result[0];
                    const grouping: string = result[1];
                    const isBothEmpty: boolean = isEmpty(frequency) && isEmpty(grouping);

                    if (!isBothEmpty) {
                        if (!frequency && grouping) {
                            this.updateXaxisSourceList(grouping);
                        }

                        const xAxisSourceListHasFrequency = find(this.xAxisSourceList, (list: SelectionItem) => list.id === 'frequency');
                        if (frequency && !xAxisSourceListHasFrequency) {
                            this.updateXaxisSourceList(grouping);
                        }
                    }
                    else if(isBothEmpty && this.xAxisSourceList.length){
                        this.updateXaxisSourceList(null);
                    }
                })
            );
        }
    }

    private _canShowTour() {
        if (!this.vm.showChartTour) { return; }
        this.vm.startTour();
        this.vm.disableChartTour();
    }

    private _createKpiFormGroup(chartType: ChartType | string) {
        return this.formBuilder.group({
            type: new FormControl(chartType),
            kpi: new FormControl()
        });
    }

    private _subscribeToChartTypeChanges() {
        const that = this;
        this._chartGalleryService.activeChart$.subscribe((chart) => {
            that.chartCombinations = chart.combinations || [chart.type];
            const kpiFormArray = that.fg.controls['kpis'] as FormArray;

            const kpiSelection = kpiFormArray.value;

            while (kpiFormArray.length !== 0) {
                kpiFormArray.removeAt(0);
            }

            that.chartCombinations.map(
                c => that._createKpiFormGroup(c))
                    .forEach((c, index) => {
                        if (kpiSelection[index]) {
                            const newValue = c.value;
                            newValue.kpi = kpiSelection[index].kpi;
                            newValue.type = that.chartCombinations[index];
                            c.patchValue(newValue);
                        }
                        kpiFormArray.push(c);
                    });

            that.groupingList = [];
            this._getGroupingInfo(chart);
            that.chartType = String(chart.type);
            this.ischartTypeMap = chart.name === 'map';
            that._resetFrequencyAndSource(that.chartType);
        });
    }
    private _subscribeToSortCriteriaListChanges() {
        const that = this;
        that._chartGalleryService.sortingCriteriaList$.subscribe((criteriaList) => {
            that.sortingCriteriaList = criteriaList;
        });
    }


    /**
     * when chart type is changed to 'pie',
     * clear frequency and xAxisSource
     */
    private _resetFrequencyAndSource(chartType: string): void {
        if (chartType.toLowerCase() !== 'pie') {
            return;
        }

        const values: IChart = this.fg.value;

        if (values.frequency || values.xAxisSource) {
            setTimeout(() => {
                const copyFrequencyList: SelectionItem[] = clone(this.frequencyList);
                const copyXSourceList: SelectionItem[] = clone(this.xAxisSourceList);

                // frequency
                copyFrequencyList.forEach((fList: SelectionItem) => {
                    fList.selected = false;
                });
                // xAxisSource
                copyXSourceList.forEach((xSource: SelectionItem) => {
                    xSource.selected = false;
                });

                this.frequencyList = copyFrequencyList;
                this.xAxisSourceList = copyXSourceList;

                this.frequencyPicker.resetSelectedItems();
                this.xSourcePicker.resetSelectedItems();
            }, 100);
        }
    }

    private _subscribeToXAxisChanges() {
        const that = this;
        if (that.fg.controls['xAxisSource']) {

            this.subscribedToXaxisSource = true;

            that._subscription.push(that.fg.controls['xAxisSource'].valueChanges
                .debounceTime(100)
                .distinctUntilChanged()
                .subscribe(x => {
                    if(!that.xAxisSourceList.length && x === 'frequency'){
                        this.updateXaxisSourceList(this.fg.value.grouping);
                    }
                    const xAxisSelectionList =  clone(that.xAxisSourceList);
                    for (let i = 0; i < xAxisSelectionList.length; i++) {
                        xAxisSelectionList[i].selected = xAxisSelectionList[i].id === x ? true : false;
                    }
                    that.xAxisSourceList = xAxisSelectionList;
            }));
        }
    }

    private _updateComparisonData(yearOldestDate: string) {
        if (this.fg.value.predefinedDateRange === '') { return; }
        if (!yearOldestDate) { return this.vm.comparisonList = []; }

        this.fg.controls['loadingComparison'].patchValue(true, { emitEvent: false });

        this.comparisonList = [];
        const dateRange = this.dateRanges.find(d => d.dateRange.predefined === this.fg.value.predefinedDateRange);
        const itemsComparison = [this.fg.value.predefinedDateRange, ''];
        let newItem: SelectionItem = {};
        for (let i = 0; i < dateRange.comparisonItems.length ; i++) {
            itemsComparison[1] = dateRange.comparisonItems[i].key;
            const yearofDateFrom = parseComparisonDateRange(<any>itemsComparison, itemsComparison[0]).from.getFullYear();
            if (yearofDateFrom >= parseInt(yearOldestDate, 0)) {
                const thisTitle = dateRange.comparisonItems[i].value.includes('year')
                ? dateRange.comparisonItems[i].value + ' (' + yearofDateFrom + ')'
                : dateRange.comparisonItems[i].value;
                newItem = {
                    id: dateRange.comparisonItems[i].key,
                    title: thisTitle,
                    selected: false,
                    disabled: false
                };
                this.comparisonList.push(newItem);
            }
        }
        this.vm.comparisonList = this.comparisonList;
        const currentComparisonValue = this.fg.get('comparison') ? this.fg.get('comparison').value : '';

        let currentComparisonValueArr = [];
        if(currentComparisonValue && currentComparisonValue.length){
            currentComparisonValueArr = (currentComparisonValue.includes('|')) ? 
                                        currentComparisonValue.split('|') : [currentComparisonValue]
        }

        let nextComparisonValue;
        const comparisonIds = this.comparisonList.map(g => g.id);
        if (!comparisonIds.length || !currentComparisonValueArr.some(v => comparisonIds.includes(v) )) {
            nextComparisonValue = '';
        } else {
            nextComparisonValue = currentComparisonValue;
        }
        if (this.fg.get('comparison')) {
            this.fg.controls['comparison'].patchValue(nextComparisonValue, { emitEvent: true });
        }
        this.fg.controls['loadingComparison'].patchValue(false, { emitEvent: false });

    }

    private _dateRangesQuery() {
        const that = this;
        this._subscription.push(this._apollo.watchQuery <{ dateRanges: IDateRangeItem[]}> ({
            query: chartsGraphqlActions.dateRanges,
            fetchPolicy: 'network-only'
        })
        .valueChanges.subscribe(({ data }) => {
            that.dateRanges = data.dateRanges;
        }));
    }

  private _subscribeToComparisonChanges() {
    const that = this;
    if (that.fg.controls['comparison']) {
        that._subscription.push(that.fg.controls['comparison'].valueChanges.subscribe(c => {
            if (isEmpty(c)) {
                return;
            }
            this.isCollapsedComparison = false;
        }));
    }
  }
  private _resetCustomDateRangeControls(): void {
    if (this.fg && this.fg.controls && this.fg.controls['predefinedDateRange']) {

        this._subscription.push(
            this.fg.controls['predefinedDateRange']
            .valueChanges
            .subscribe(value => {
                if (value !== 'custom') {
                    const hasCustomDateRangeControls = (this.fg.controls['customFrom']) || (this.fg.controls['customTo']);

                    if (hasCustomDateRangeControls) {
                        // reset controls when daterange change from 'custom' to predefined value
                        this.fg.controls['customFrom'].patchValue('');
                        this.fg.controls['customTo'].patchValue('');
                    }
                }
            })
        );
    }
  }

  private _loadingGroupings(): void {
    let interval: any;

    if (this.loadingGroupings) {
        const that = this;
        let text = '';
        interval = setInterval(() => {
            text += '.';

            if (text.length === 8) {
                text = '';
            }
            that._renderer.setElementProperty(
                that.loadingGEle.nativeElement,
                'innerHTML',
                `Loading Grouping List, please wait ${text}`
            );
        }, 200);
    } else {
        clearInterval(interval);
    }
}
}

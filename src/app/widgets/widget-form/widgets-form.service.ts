import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import * as Promise from 'bluebird';
import { clone, isEmpty } from 'lodash';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { KpisQuery } from '../../charts/shared/graphql';
import { chartsGraphqlActions } from '../../charts/shared/graphql/charts.graphql-actions';
import { SelectionItem } from '../../ng-material-components';
import { IsNullOrWhiteSpace, ToSelectionItemList } from '../../shared/extentions';
import { IChart } from '../../charts/shared/models/chart.models';
import { IDateRangeItem } from '../../shared/models/date-range';
import { widgetsGraphqlActions } from '../shared/graphql/widgets.graphql-actions';
import {
    IWidget,
    IWidgetFormGroupValues,
    IWidgetInput,
    WidgetTypeEnum,
    WidgetTypeMap,
} from '../shared/models/widget.models';
import { IKPI } from '../../shared/domain/kpis/kpi';
import { INumericWidgetAttributes } from '../shared/models';
import { PredefinedDateRanges, IChartDateRange } from '../../shared/models';
import { IDashboard } from '../../charts/shared/models/dashboard.models';

const newWidgetModel = {
  name: 'Sample Widget',
  description: 'Here goes the description',
  order: 4,
  type: 'numeric',
  size: 'small',
  color: 'white',
  fontColor: 'black',
  preview: true
};

@Injectable()
export class WidgetsFormService {

  private _widgetModel: IWidget = clone(newWidgetModel);

  private charts: IChart[] = [];
  private kpis: IKPI[] = [];
  private dashboards: IDashboard[] = [];
  private dateRanges: IDateRangeItem[] = [];

  private _latestFormValue: IWidgetFormGroupValues;

  public dateRangesQuery: QueryRef<any>;
  public kpisQuery: QueryRef<any>;
  public chartsQuery: QueryRef<any>;
  public dashboardsQuery: QueryRef<any>;

  private chartList: SelectionItem[] = [];
  private kpiList: SelectionItem[] = [];
  private dashboardList: SelectionItem[] = [];
  // get kpi after create kpi
  private updatedKpiList: any[] = [];
  private updatedDashboardList: any[] = [];
  private comparisonList: SelectionItem[] = [];
  private dateRangeList: SelectionItem[] = [];

  private _widgetModelValidSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private _kpiListSubject: BehaviorSubject<SelectionItem[]> = new BehaviorSubject<SelectionItem[]>(this.kpiList);
  private _dashboardListSubject: BehaviorSubject<SelectionItem[]> = new BehaviorSubject<SelectionItem[]>(this.dashboardList);
  private _updateKpiListSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(this.updatedKpiList);
  private _updateDashboardListSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(this.updatedDashboardList);
  private _chartListSubject: BehaviorSubject<SelectionItem[]> = new BehaviorSubject<SelectionItem[]>(this.chartList);
  private _dateRangeListSubject: BehaviorSubject<SelectionItem[]> = new BehaviorSubject<SelectionItem[]>(this.dateRangeList);

  private _subscription: Subscription[] = [];

  private _existDuplicatedName: boolean;

  private readonly _momentFormat = 'MM/DD/YYYY';

  constructor(private _apollo: Apollo) {
    this.dateRangesQuery = this._apollo.watchQuery <{ dateRanges: IDateRangeItem[]}> ({
      query: chartsGraphqlActions.dateRanges,
      fetchPolicy: 'network-only'
    });
    this._subscription.push(this.dateRangesQuery.valueChanges.subscribe(res => this._handleDateRangesQueryResponse(res)));

    this.chartsQuery = this._apollo.watchQuery <{ listCharts: {data: IChart[]} }> ({
      query: widgetsGraphqlActions.listWidgetCharts,
      fetchPolicy: 'network-only'
    });

    this._subscription.push(this.chartsQuery.valueChanges.subscribe(res => this._handleChartsQueryResponse(res)));

    this.kpisQuery = this._apollo.watchQuery <{ kpis: IKPI[]}>
    ({
        query: KpisQuery,
        fetchPolicy: 'network-only'
    });

    this._subscription.push(this.kpisQuery.valueChanges.subscribe(res => this._handleKpisQueryResponse(res)));

    this.dashboardsQuery = this._apollo.watchQuery<{dashboards: IDashboard[]}>
        ({
          query: widgetsGraphqlActions.listWidgetDashboards,
          fetchPolicy: 'network-only'
        });

        this._subscription.push(this.dashboardsQuery.valueChanges.subscribe(res => this._handleDashboardsQueryResponse(res)));
  }

  newModel() {
    this._widgetModel = clone(newWidgetModel);
  }

  loadModel(data: IWidget) {
    this._widgetModel = this._getCleanWidgetModel(data);
  }

  setUpdateKpiList(kpis: IKPI[]): void {
    if (!kpis || !kpis.length) { return; }
    this.updatedKpiList = kpis;
    this._updateKpiListSubject.next(this.updatedKpiList);
  }

  processFormChanges(values: IWidgetFormGroupValues): Promise<IWidget> {
    debugger;
    // common properties
    this._widgetModel['preview'] = true;
    this._widgetModel['name'] = values.name;
    this._widgetModel['description'] = values.description;
    this._widgetModel['size'] = values.size;
    this._widgetModel['type'] = values.type;
    this._widgetModel['order'] = Number(values.order);
    this._widgetModel['color'] = values.color;
    this._widgetModel['fontColor'] = values.fontColor;

    // numeric properties
    if (values.type === 'numeric') {
      this._widgetModel['chartWidgetAttributes'] = null;
      const customDateRange = (values.customFrom && values.customTo)
                              ? { from: values.customFrom, to: values.customTo }
                              : null;
      this._widgetModel['numericWidgetAttributes'] = <any>this._widgetModel['numericWidgetAttributes'] || {};
      this._widgetModel['numericWidgetAttributes']['dateRange'] = { predefined: values.predefinedDateRange,
                                                                    custom: <any>customDateRange };
      this._widgetModel['numericWidgetAttributes']['kpi'] = values.kpi;
      this._widgetModel['numericWidgetAttributes']['format'] = values.format || null;


      const dateRangeChanged = (values && values.predefinedDateRange && values.predefinedDateRange && !this._latestFormValue) ||
                               (values.predefinedDateRange && this._latestFormValue.predefinedDateRange &&
                                values.predefinedDateRange !== this._latestFormValue.predefinedDateRange) ||
                               (values.customFrom && this._latestFormValue.customFrom &&
                                 values.customTo && this._latestFormValue.customTo &&
                                 JSON.stringify(customDateRange) !== JSON.stringify({ from: this._latestFormValue.customFrom,
                                                                                     to: this._latestFormValue.customTo }));

      if (dateRangeChanged && values.predefinedDateRange && this._latestFormValue && this._latestFormValue.predefinedDateRange &&
        values.predefinedDateRange !== 'custom') {
          this._widgetModel['numericWidgetAttributes']['dateRange']['custom'] = undefined;
      }

      if (!values.comparison /*|| dateRangeChanged */) {
        this._widgetModel['numericWidgetAttributes'] = <any>this._widgetModel['numericWidgetAttributes'] || {};
        this._widgetModel['numericWidgetAttributes']['comparison'] = undefined;
        this._widgetModel['numericWidgetAttributes']['comparisonArrowDirection'] = '';
      } else {
        this._widgetModel['numericWidgetAttributes'] = <any>this._widgetModel['numericWidgetAttributes'] || {};
        this._widgetModel['numericWidgetAttributes']['comparison'] = this._getComparisonValue(values);
        this._widgetModel['numericWidgetAttributes'] = <any>this._widgetModel['numericWidgetAttributes'] || {};
        this._widgetModel['numericWidgetAttributes']['comparisonArrowDirection'] = values.comparisonArrowDirection;
      }
    }

    // chart properties
    if (values.type === 'chart') {
      this._widgetModel['color'] = 'white';
      this._widgetModel['numericWidgetAttributes'] = null;

      this._widgetModel['chartWidgetAttributes'] = <any>this._widgetModel['chartWidgetAttributes'] || {};
      this._widgetModel['chartWidgetAttributes']['chart'] = values.chart;
    }

    this._latestFormValue = values;

    const that = this;
    const kpi = this._widgetModel && this._widgetModel.numericWidgetAttributes
                ? this._widgetModel.numericWidgetAttributes.kpi
                : null;
    const dateRange = this._widgetModel && this._widgetModel.numericWidgetAttributes &&
                this._widgetModel.numericWidgetAttributes.dateRange
                ? this._widgetModel.numericWidgetAttributes.dateRange
                : null;
    const chart = this._widgetModel && this._widgetModel.chartWidgetAttributes
                  ? this._widgetModel.chartWidgetAttributes.chart
                  : null;

    const dateRangeIsValid: boolean = this._isDateRangeValid(dateRange);

    const kpiWithDaterange: boolean = !!(kpi && dateRange && dateRangeIsValid);
    const isComparisonValid: boolean = this._isComparisonValid();

    if (!this._widgetModel.name || !this._widgetModel.type
      || (!kpiWithDaterange && !chart) || !isComparisonValid
      || !this._widgetModel.color || !this._widgetModel.fontColor) {
       that._widgetModelValidSubject.next(false);
       return Promise.resolve(this._widgetModel);
    }

    return new Promise<IWidget>((resolve, reject) => {
      that._materializeWidget(this._widgetModel).then(materializedWidget => {
        if (materializedWidget) {
          that._widgetModel = that._getCleanWidgetModel(materializedWidget);
          that._widgetModel['dashboards'] = values.dashboards.split('|');
          that._widgetModelValidSubject.next(true);
          resolve(that.widgetModel);
          return;
        }
        this._widgetModel['dashboards'] = values.dashboards.split('|');
        that._widgetModelValidSubject.next(false);
        resolve(this._widgetModel);
        return;
      })
      .catch(err => {
        // console.log('error when requesting preview of widget: ' + err);
      });
    });
  }

  private _isComparisonValid(): boolean {
    // i.e. null, undefined, '', {}
    if (isEmpty(this._widgetModel)) {
      return true;
    }
    if (this._widgetModel.type !== 'numeric') {
      return true;
    }
    const attributes: INumericWidgetAttributes = this._widgetModel.numericWidgetAttributes;
    // i.e. ['previousPeriod']
    const hasComparison: boolean = Array.isArray(attributes.comparison) && !isEmpty(attributes.comparison);
    // i.e. { predefined: 'all times', custom: null }
    const hasDateRange: boolean = !isEmpty(attributes.dateRange) && !isEmpty(attributes.dateRange.predefined);

    // if(isEmpty(this.comparisonList) && attributes.comparison 
    // && Array.isArray(attributes.comparison) &&
    //  attributes.comparison.length > 0){
    //   return false;
    // }

    if (!hasComparison || !hasDateRange) {
      return true;
    }

    // 'all times'
    const numericPredefinedDateRange: string = attributes.dateRange.predefined;
    // 'previousPeriod'
    const numericComparisonValue: string = attributes.comparison[0];

    // 'previousPeriod' && 'all times'
    if (numericComparisonValue && numericPredefinedDateRange === PredefinedDateRanges.allTimes) {
      return false;
    }

    return true;
  }

  private _getComparisonValue(values: IWidgetFormGroupValues): string[] {

    /* if date range is "all times" */
    if (values.predefinedDateRange === PredefinedDateRanges.allTimes) {
      return [];
    }
    
    return [values.comparison];
  }

  private _isDateRangeValid(dateRange: IChartDateRange): boolean {
    if (dateRange && dateRange.predefined) {
        if (dateRange.predefined === 'custom') {
            return this._isCustomDateRangeValid(dateRange);
        }
        return true;
    }

    return false;
  }

  private _isCustomDateRangeValid(dateRange: IChartDateRange): boolean {
    if (!dateRange.custom) {
      return false;
    }

    const customFrom: moment.Moment = moment(dateRange.custom.from, this._momentFormat, 'en', true);
    const customTo: moment.Moment = moment(dateRange.custom.to, this._momentFormat, 'en', true);

    const isCustomDateValid: boolean = customFrom.isValid() && customTo.isValid();
    const isFromBeforeTo: boolean =  customTo.isSameOrAfter(customFrom);

    return isCustomDateValid && isFromBeforeTo;
  }

  private _materializeWidget(widget: IWidget): Promise<IWidget> {
    const that = this;
    const payload = this.getWidgetPayload();

    return new Promise<IWidget>((resolve, reject) => {
      that._subscription.push(that._apollo.watchQuery <{ previewWidget: IWidget}> ({
        query: widgetsGraphqlActions.previewWidget,
        variables: { input: payload },
        fetchPolicy: 'network-only'
      })
      .valueChanges.subscribe(res => {
          if (res.data.previewWidget) {
            resolve(res.data.previewWidget);
            return;
          }

          resolve(widget);
          return;
      }));
    });
  }

  /**
   * @param res
   * this method would be called after create kpi sometimes
   * and not get the updated list
   */
  private _handleKpisQueryResponse(res: any) {
    this._subscription.push(this.updatedKpiList$.subscribe(list => {
      if (!list || !list.length) {
        this.kpis = res.data.kpis;
        this.kpiList = ToSelectionItemList(this.kpis, '_id', 'name');
        this._kpiListSubject.next(this.kpiList);
      } else {
        if (list.length !== res.data.kpis.length) {
          this.kpiList = ToSelectionItemList(list, '_id', 'name');
          this._kpiListSubject.next(this.kpiList);
        }
      }
    }));

  }

  private _handleDateRangesQueryResponse(res: any) {
    this.dateRanges = res.data.dateRanges;
    const list = this.dateRanges.map(d => ({ id: d.dateRange.predefined, title: d.dateRange.predefined }));
    this.dateRangeList = list;
    this._dateRangeListSubject.next(list);
  }

  private _handleChartsQueryResponse(res: any) {
    this.charts = res.data.listCharts.data;
    this.chartList = ToSelectionItemList(this.charts, '_id', 'title');
    this._chartListSubject.next(this.chartList);
  }

  private _handleDashboardsQueryResponse(res: any) {
        this._subscription.push(this.updatedDashboardsList$.subscribe(list => {
          if (!list || !list.length) {
            this.dashboards = res.data.dashboards;
            this.dashboardList = ToSelectionItemList(this.dashboards, '_id', 'name');
            this._dashboardListSubject.next(this.dashboardList);
          } else {
            if (list.length !== res.data.dashboards.length) {
              this.dashboardList = ToSelectionItemList(list, '_id', 'name');
              this._dashboardListSubject.next(this.dashboardList);
            }
          }
        }));
  }

  public getComparisonListForDateRange(dateRangeString: string) {
    const that = this;

    if (IsNullOrWhiteSpace(dateRangeString)) { return; }
    const dateRange = this.dateRanges.find(d => d.dateRange.predefined === dateRangeString);
    if (!dateRange) {
        this.comparisonList = [];
        return [];
    }

    const list = dateRange.comparisonItems.map(i => ({ id: i.key, title: i.value }));
    this.comparisonList = list;
    return list;
  }

  private _getCleanWidgetModel(widget: IWidget): IWidget {
      const customDateRange = (widget.numericWidgetAttributes &&
                              widget.numericWidgetAttributes.dateRange &&
                              widget.numericWidgetAttributes.dateRange.custom &&
                              widget.numericWidgetAttributes.dateRange.custom.from &&
                              widget.numericWidgetAttributes.dateRange.custom.to
                              )
                              ? { from: moment(widget.numericWidgetAttributes.dateRange.custom.from).format(this._momentFormat),
                                  to: moment(widget.numericWidgetAttributes.dateRange.custom.to).format(this._momentFormat) } as any
                              : null;

    switch (WidgetTypeMap[widget.type]) {
      case WidgetTypeEnum.Chart:
            const chartWidget: IWidget = {
              order: widget.order,
              name: widget.name,
              description: widget.description,
              type: widget.type,
              size: widget.size,
              color: 'white', // all chart widgets are white
              fontColor: 'black',
              chartWidgetAttributes: {
                chart: widget.chartWidgetAttributes.chart
              },
              preview: widget.preview,
              materialized: widget.materialized
                            ? {
                               chart: widget.materialized ? widget.materialized.chart : null
                             }
                            : null,
              tags: widget.tags,
              dashboards: widget.dashboards
            };
            return chartWidget;
      case WidgetTypeEnum.Numeric:
          const numericWidget: IWidget = {
            order: widget.order,
            name: widget.name,
            description: widget.description,
            type: widget.type,
            size: widget.size,
            color: widget.color,
            fontColor: widget.fontColor,
            numericWidgetAttributes: {
              kpi: widget.numericWidgetAttributes.kpi,
              format: widget.numericWidgetAttributes.format,
              dateRange: {
                predefined: widget.numericWidgetAttributes.dateRange.predefined,
                custom: customDateRange
              },
              comparison: widget.numericWidgetAttributes.comparison,
              comparisonArrowDirection: widget.numericWidgetAttributes.comparisonArrowDirection || '',
            },
            materialized: widget.materialized
                          ? {
                              value: widget.materialized.value,
                              comparison: widget.materialized.comparison
                                          ? {
                                              period: widget.materialized.comparison
                                                      ? widget.materialized.comparison.period
                                                      : null,
                                              value: widget.materialized.comparison
                                                    ? widget.materialized.comparison.value
                                                    : null,
                                              arrowDirection: widget.materialized.comparison
                                                              ? widget.materialized.comparison.arrowDirection
                                                              : null,
                                            }
                                          : null
                            }
                          : null,
            preview: widget.preview,
            tags: widget.tags,
            dashboards: widget.dashboards
          };
          return numericWidget;

      default:
          return widget;
    }
  }

  public getWidgetPayload(): IWidgetInput {

    const clean = this._getCleanWidgetModel(this._widgetModel);
    delete clean.materialized;
    return clean;
  }

  public getWidgetFormValues(): IWidgetFormGroupValues {
    switch (WidgetTypeMap[this._widgetModel.type]) {
      case WidgetTypeEnum.Chart:
            const chartWidgetFormGroup: IWidgetFormGroupValues = {
              order: String(this._widgetModel.order),
              name: this._widgetModel.name,
              description: this._widgetModel.description,
              type: this._widgetModel.type,
              size: this._widgetModel.size,
              color: 'white', // all chart widgets are white
              fontColor: 'black',
              chart: this._widgetModel.chartWidgetAttributes.chart,
              dashboards: this._widgetModel.dashboards ? this._widgetModel.dashboards.join('|') : ''
            };
            return chartWidgetFormGroup;
      case WidgetTypeEnum.Numeric:
          const numericWidget: IWidgetFormGroupValues = {
            order: String(this._widgetModel.order),
            name: this._widgetModel.name,
            description: this._widgetModel.description,
            type: this._widgetModel.type,
            size: this._widgetModel.size,
            color: this._widgetModel.color, // all chart widgets are white
            fontColor: this._widgetModel.fontColor,
            kpi: this._widgetModel.numericWidgetAttributes
                  ? this._widgetModel.numericWidgetAttributes.kpi
                  : '',
            format: this._widgetModel.numericWidgetAttributes
                  ? this._widgetModel.numericWidgetAttributes.format
                  : '',
            predefinedDateRange: this._widgetModel.numericWidgetAttributes
                                 ? this._widgetModel.numericWidgetAttributes.dateRange.predefined
                                 : '',

            customFrom: this._widgetModel.numericWidgetAttributes
                        ? this._widgetModel.numericWidgetAttributes.dateRange.custom
                            ? moment(this._widgetModel.numericWidgetAttributes.dateRange.custom.from).format(this._momentFormat) || null
                            : ''
                        : '',
            customTo: this._widgetModel.numericWidgetAttributes
                        ?   this._widgetModel.numericWidgetAttributes.dateRange.custom
                            ? moment(this._widgetModel.numericWidgetAttributes.dateRange.custom.to).format(this._momentFormat) || null
                            : ''
                        : '',
            comparison: this._widgetModel.numericWidgetAttributes
                        ? this._widgetModel.numericWidgetAttributes.comparison
                          ? this._widgetModel.numericWidgetAttributes.comparison[0]
                          : ''
                        : '',
            comparisonArrowDirection: this._widgetModel.numericWidgetAttributes
                                      ? this._widgetModel.numericWidgetAttributes.comparisonArrowDirection
                                      : '',
            dashboards: this._widgetModel.dashboards ? this._widgetModel.dashboards.join('|') : ''
          };
        return numericWidget;

      default:
          return null;
    }
  }

  get subscriptions(): Subscription[] {
    return this._subscription;
  }

  updateExistDuplicatedName(exists: boolean) {
    this._existDuplicatedName = exists;
  }

  getExistDuplicatedName() {
    return this._existDuplicatedName;
  }

  get widgetModelValid$() {
    return this._widgetModelValidSubject.asObservable();
  }

  get kpiList$() {
    return this._kpiListSubject.asObservable();
  }

  get updatedKpiList$() {
    return this._updateKpiListSubject.asObservable().distinctUntilChanged();
  }

  get chartList$() {
    return this._chartListSubject.asObservable();
  }

  get dashboardList$() {
    return this._dashboardListSubject.asObservable();
  }

  get updatedDashboardsList$() {
    return this._updateDashboardListSubject.asObservable().distinctUntilChanged();
  }

  get dateRangeList$() {
    return this._dateRangeListSubject.asObservable();
  }

  get widgetModel() {
    return this._widgetModel;
  }

}

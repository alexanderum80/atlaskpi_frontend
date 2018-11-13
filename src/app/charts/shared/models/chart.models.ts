import { TooltipFormats } from '../ui/chart-format-info/tooltip-formats';
import { FormGroup } from '@angular/forms';
import { isEmpty, isBoolean } from 'lodash';
import * as moment from 'moment';

import { IKPI } from '../../../shared/domain/kpis/kpi';
import { IMutationResponse } from '../../../shared/models';
import { ChartDateRangeModel, IChartDateRange } from '../../../shared/models/date-range';
import { IDashboard } from './dashboard.models';
import {IChartTop} from '../../../shared/models/top-n-records';
import { IMap } from '../../../maps/shared/models/map.models';

export interface ChartData {
  _id: string;
  dateFrom: string;
  dateTo: string;
  name: string;
  description: string;
  group: string;
  kpis: any[];
  chartDefinition: any;
  targetExtraPeriodOptions?: any;
  canAddTarget?: boolean;
  targetList?: any[];
  title?: string;
  frequency?: string;
  dateRange?: IChartDateRange[];
  xAxisSource: string;
  comparison: string[];
  groupings: string[];
}

export enum ChartType {
    Area,
    Bar,
    Bubble,
    Column,
    Line,
    Pie,
    Polar
}

export interface IChartInput {
  title: string;
  subtitle?: string;
  group?: string;
  kpis: [string];
  dateRange: IChartDateRange;
  filter?: any;
  frequency?: string;
  groupings?: string[];
  xFormat?: string;
  yFormat?: string;
  chartDefinition: any;
  xAxisSource: string;
  comparison?: string[];
  dashboards?: string[];
}

export interface IChart {
    _id?: any;
    title: string;
    subtitle?: string;
    group?: string;
    kpis: [IKPI];
    dateRange: IChartDateRange;
    top: IChartTop;
    frequency: string;
    groupings: string[];
    sortingCriteria: string;
    sortingOrder: string;
    xFormat?: string;
    yFormat?: string;
    chartDefinition: any;
    xAxisSource: string;
    dashboards?: string[];
    size?: string;
}

export interface IChartGalleryItem {
    name: string;
    type?: ChartType | string;
    kpiId?: string;
    selected?: boolean;
    img?: string;
    configName?: string;
    sampleDefinition?: any;
}


export interface ListChartsQueryResponse {
  listCharts: {
      data: IChart[]
  };
}

export interface ListMapsQueryResponse {
  listMaps: {
      data: any[]
  };
}

export interface DateRange {
  from: string;
  to: string;
}

export interface IChartVariable {
  id: string;
  dateRange: DateRange;
  frequency; string;
}

export interface IChartFormValues {
  // basic info
  title?: string;
  subtitle?: string;
  name: string;
  group?: string;
  kpis?: [IKPI];
  description?: string;
  predefinedDateRange?: string;
  customFrom?: string;
  customTo?: string;
  predefinedTop?: string;
  customTop?: number;
  frequency?: string;
  sortingCriteria?: string;
  sortingOrder?: string;
  kpi: string;
  grouping?: string;
  xAxisSource?: string;
  comparison?: string;
  dashboards?: string;

  // chart format info
  xAxisTitle?: string;
  yAxisTitle?: string;
  predefinedYAxisFormat?: string;
  yAxisPrefix?: string;
  yAxisSuffix?: string;
  legendEnabled: boolean;
  invertAxisEnabled: boolean;
  legendAlign?: string;
  legendVerticalAlign?: string;
  legendLayout?: string;
  tooltipEnabled: boolean;
  predefinedTooltipFormat?: string;
  seriesDataLabels: boolean;
  // gridlines
  gridLineWidth?: number;

}

export interface IUpdateChartResponse {
    updateChart: IMutationResponse;
}

export interface EditChartResponse {
  chart: string;
}


export interface ISaveChartResponse {
    createChart: IMutationResponse;
}

export interface IdNameKpi {
    _id: string | number;
    name: string;
}

export interface KPIListResponse {
    kpis: IKPI[];
}

export interface SingleChartResponse {
  chart: string;
}

export interface SingleMapResponse {
  map: string;
}

export class ChartModel {
    _id?: any;
    title: string;
    subtitle?: string;
    group?: string;
    kpis: [IKPI];
    dateRange: IChartDateRange;
    top: IChartTop;
    frequency: string;
    groupings: string[];
    sortingCriteria?: string;
    sortingOrder?: string;
    xFormat?: string;
    yFormat?: string;
    chartDefinition: any;
    xAxisSource: string;
    comparison?: string[];
    dashboards: IDashboard[];

    static fromJson(json: string): ChartModel {
      try {
        return new ChartModel(JSON.parse(json));
      } catch (err) {
        return undefined;
      }
    }

    static fromFormGroup(fg: FormGroup, chartDefinition: any, checkFormatter?: boolean): ChartModel {
      const proxyChartModel = new ChartModel({});
      proxyChartModel.chartDefinition = chartDefinition;

      // basic info
      proxyChartModel.title = fg.value.name;
      proxyChartModel.subtitle = fg.value.description;
      proxyChartModel.group = fg.value.group;
      proxyChartModel.kpis = <any>[fg.value.kpi];
      proxyChartModel.dateRange = { predefined: fg.value.predefinedDateRange,
                                    custom: { from: fg.value.customFrom || null,
                                              to: fg.value.customTo || null  }};
      proxyChartModel.top = {
        predefined: fg.value.predefinedTop || null,
        custom: fg.value.customTop ? +fg.value.customTop : null
      };
      proxyChartModel.frequency = fg.value.frequency;
      proxyChartModel.groupings = fg.value.grouping;
      proxyChartModel.sortingCriteria = fg.value.sortingCriteria;
      proxyChartModel.sortingOrder = fg.value.sortingOrder;
      proxyChartModel.xAxisSource = fg.value.xAxisSource;
      proxyChartModel.comparison = fg.value.comparison && !isEmpty(fg.value.comparison) ? fg.value.comparison.split('|') : null;
      proxyChartModel.dashboards = fg.value.dashboards ? fg.value.dashboards.split('|').map(d => d.trim()) : [];

      // fill legend object
      proxyChartModel.chartDefinition.legend = { enabled: fg.value.legendEnabled || false };
      if (proxyChartModel.isLegendEnabled) {
        proxyChartModel.chartDefinition.legend.align = fg.value.legendAlign;
        proxyChartModel.chartDefinition.legend.verticalAlign = fg.value.legendVerticalAlign;
        proxyChartModel.chartDefinition.legend.layout = fg.value.legendLayout;

        if (chartDefinition.chart.type === 'pie') {
          const plotChartTypeOptions = proxyChartModel.chartDefinition.plotOptions[chartDefinition.chart.type];

          if (proxyChartModel.chartDefinition.legend && proxyChartModel.chartDefinition.legend.enabled) {
            if (isEmpty(plotChartTypeOptions)) {
              proxyChartModel.chartDefinition.plotOptions[chartDefinition.chart.type] = {};
            }

            proxyChartModel.chartDefinition.plotOptions[chartDefinition.chart.type].showInLegend = true;
            // reset frequency, and xAxisSource when chart type
            // has been changed to 'pie'
            proxyChartModel.frequency = '';
            proxyChartModel.xAxisSource = '';
          }
        }
      }

      if (!fg.value.tooltipEnabled || (fg.value.tooltipEnabled && !fg.value.tooltipCustomEnabled && !fg.value.predefinedTooltipFormat)) {
        if (!proxyChartModel.chartDefinition.tooltip) {
          proxyChartModel.chartDefinition.tooltip = {};
        }
        proxyChartModel.chartDefinition.tooltip = { enabled: false };
      }

      if (checkFormatter) {
        // convert tooltip formatter to string when saving
        // the formatter is a function, when stringify the tooltip, the formatter disappears
        if (proxyChartModel.chartDefinition.tooltip && proxyChartModel.chartDefinition.tooltip.enabled) {
          const tooltip = proxyChartModel.chartDefinition.tooltip;

          if (!tooltip.custom) {
          const formatterType = Object.prototype.toString.call(tooltip.formatter);
          if (formatterType === '[object Function]') {
            const findToolTip = TooltipFormats.find(t => {
              return (t.definition as any).altas_definition_id === tooltip.altas_definition_id;
            });
            proxyChartModel.chartDefinition.tooltip = findToolTip.definition;
          }
        }
        }
      }
      proxyChartModel.chartDefinition.invertAxis = {enabled: fg.value.invertedAxis || false};
      // removegridlines
      if (proxyChartModel.chartDefinition.yAxis) {
        proxyChartModel.chartDefinition.yAxis.gridLineWidth = fg.value.removeGridlines ? 0 : 1;
      }
      // convert the definition to string
      proxyChartModel.chartDefinition = JSON.stringify(proxyChartModel.chartDefinition);

      return proxyChartModel;
    }

    toChartFormValues(): IChartFormValues {
      if (!this.chartDefinition) {
        return undefined;
      }

      return {
        // basic info
        name: this.title,
        description: this.subtitle || undefined,
        predefinedDateRange: this.dateRange ? this.dateRange.predefined : undefined,
        customFrom: (this.dateRange && this.dateRange.custom && this.dateRange.custom.from) ?
                    moment(this.dateRange.custom.from).format('MM/DD/YYYY') : undefined,
        customTo: (this.dateRange && this.dateRange.custom && this.dateRange.custom.to) ?
                    moment(this.dateRange.custom.to).format('MM/DD/YYYY') : undefined,
        predefinedTop: this.top ? this.top.predefined : undefined,
        customTop: (this.top && this.top.custom) ? this.top.custom : undefined,
        frequency: this.frequency,
        sortingCriteria: this.sortingCriteria,
        sortingOrder: this.sortingOrder,
        group: this.group || undefined,
        grouping: this.groupings ? this.groupings[0] || undefined : undefined,
        kpi: this.kpis ? this.kpis[0]._id || undefined : undefined,
        xAxisSource: this.xAxisSource || '',
        comparison: this.comparison ? this.comparison.map(c => c).join('|') : undefined,
        dashboards: this.dashboards ? this.dashboards.map(d => d._id).join('|') : undefined,

        // chart format info
        xAxisTitle: this.xAxisTitle,
        yAxisTitle: this.yAxisTitle,
        predefinedYAxisFormat: null,
        legendEnabled: this.isLegendEnabled,
        invertAxisEnabled: this.isInvertAxisEnabled,
        legendAlign: this.legendAlign,
        legendVerticalAlign: this.legendVerticalAlign,
        legendLayout: this.legendLayout,
        tooltipEnabled: this.isTooltipEnabled,
        predefinedTooltipFormat: this.predefinedTooltipDefinition,
        seriesDataLabels: this.isSerieDataLabelsEnabled,
        // remove gridlines
        gridLineWidth: this.removeGridlines
            };
    }

    constructor (obj: IChart | any) {
      Object.assign(this, obj);

      const that = this;
      setTimeout(() => {
        this.dateRange = this.dateRange ? this.dateRange[0] : this.dateRange;
      }, 0);
    }

    // type
    get type(): string {
      return this.chartDefinition.chart.type || undefined;
    }

    set type(t: string) {
      this.chartDefinition.chart.type = t;
    }

    get xAxisTitle(): string {
      if (this.chartDefinition.xAxis
          && this.chartDefinition.xAxis.title
          && this.chartDefinition.xAxis.title.text) {
        return  this.chartDefinition.xAxis.title.text;
      }
      return undefined;
    }

    get yAxisTitle(): string {
      if (this.chartDefinition.yAxis
          && this.chartDefinition.yAxis.title
          && this.chartDefinition.yAxis.title.text) {
        return  this.chartDefinition.yAxis.title.text;
      }
      return undefined;
    }
    // gridlines
    get removeGridlines(): number {
      if (this.chartDefinition.yAxis && (this.chartDefinition.yAxis.gridLineWidth >= 0)) {
      return  this.chartDefinition.yAxis.gridLineWidth;
    }
    return undefined;
    }

    get validForPreview(): boolean {
      return !isEmpty(this.kpis)
             && this.kpis.every(k => !isEmpty(k))
             && new ChartDateRangeModel(this.dateRange).valid;
    }

    get valid(): boolean {
      return this.title !== undefined && this.validForPreview;
    }


    get isTooltipEnabled(): boolean {
      if (this.chartDefinition.tooltip === undefined) {
        return true;
      }

      if (this.chartDefinition.tooltip.enabled !== undefined &&
          !this.chartDefinition.tooltip.enabled) {
          return false;
      }

      return true;
    }

    get predefinedTooltipDefinition(): string {
      if (this.chartDefinition.tooltip
          && this.chartDefinition.tooltip.altas_definition_id !== undefined) {
          return this.chartDefinition.tooltip.altas_definition_id;
      }

      return '';
    }

    get isSerieDataLabelsEnabled(): boolean {
      if (!this.chartDefinition.plotOptions
          || !this.chartDefinition.plotOptions[this.type]
          || !this.chartDefinition.plotOptions[this.type].dataLabels
          || !this.chartDefinition.plotOptions[this.type].dataLabels.enabled) {
         return false;
      }

          return this.chartDefinition.plotOptions[this.type].dataLabels.enabled;
    }


    get isInvertAxisEnabled(): boolean {
      if (!this.chartDefinition.invertAxis || !this.chartDefinition.invertAxis.enabled) {
         return false;
      }

      return true;
    }



     get isLegendEnabled(): boolean {
      if (!this.chartDefinition.legend || !this.chartDefinition.legend.enabled) {
         return false;
      }

      return true;
    }

    get legendAlign(): string {
      if (!this.chartDefinition.legend || !this.chartDefinition.legend.enabled) {
         return null;
      }

      return this.chartDefinition.legend.align || 'center';
    }

    get legendVerticalAlign(): string {
      if (!this.chartDefinition.legend || !this.chartDefinition.legend.enabled) {
         return null;
      }

      return this.chartDefinition.legend.verticalAlign || 'bottom';
    }

    get legendLayout(): string {
      if (!this.chartDefinition.legend || !this.chartDefinition.legend.enabled) {
         return null;
      }

      return this.chartDefinition.legend.layout || 'horizontal';
    }

    get isComparison(): boolean {
      return this.comparison && this.comparison.length > 0
             ? true
             : false;
    }

}

import { title } from 'change-case';
import { FormGroup } from '@angular/forms';
import { isEmpty } from 'lodash';
import * as moment from 'moment';
import { IKPI } from '../../../shared/domain/kpis/kpi';
import { IMutationResponse } from '../../../shared/models';
import { ChartDateRangeModel, IChartDateRange } from '../../../shared/models/date-range';

export interface MapData {
  _id: string;
  title?: string;
  subtitle?: string;
  description: string;
  group: string;
  dateRange?: IChartDateRange;
  groupings: string;
  size: string;
  kpi: string;
  zipCodeSource: string;
}

export interface IMapInput {
  title: string;
  subtitle?: string;
  group?: string;
  kpis: string;
  dateRange: IChartDateRange;
  groupings?: string;
  dashboards?: string[];
  size: string;
  kpi: string;
  zipCodeSource: string;
}

export interface IMap {
    _id?: any;
    title: string;
    subtitle?: string;
    group?: string;
    kpi: string;
    dateRange: IChartDateRange;
    groupings: string;
    dashboards?: string[];
    size: string;
    zipCodeSource: string;
}

export interface IMapGalleryItem {
    _id: string;
    title: string;
    selected?: boolean;
    size: string;
}


export interface ListMapsQueryResponse {
  listMaps: {
      data: IMap[]
  };
}

export interface DateRange {
  from: string;
  to: string;
}

export interface IMapVariable {
  id: string;
  dateRange: DateRange;
  frequency; string;
}

export interface IMapFormValues {
  // basic info
  name?: string;
  subtitle?: string;
  group?: string;
  kpi?: string;
  description?: string;
  predefinedDateRange?: string;
  customFrom?: string;
  customTo?: string;
  grouping?: string[];
  dashboards?: string;
  mapsize: string;
  zipCodeSource: string;
}

export interface IUpdateMapResponse {
    updateMap: IMutationResponse;
}

export interface EditMapResponse {
  map: string;
}


export interface ISaveMapResponse {
    createMap: IMutationResponse;
}

export interface IdNameKpi {
    _id: string | number;
    name: string;
}

export interface KPIListResponse {
    kpis: IKPI[];
}

export interface SingleMapResponse {
  map: string;
}

export class MapModel {
    _id?: any;
    title: string;
    subtitle?: string;
    group?: string;
    kpi: string;
    dateRange: IChartDateRange;
    groupings: string[];
    size: string;
    dashboards: string[];
    zipCodeSource: string;

    static fromJson(json: string): MapModel {
      try {
        return new MapModel(JSON.parse(json));
      } catch (err) {
        return undefined;
      }
    }

    static fromFormGroup(fg: FormGroup): MapModel {
      const proxyMapModel = new MapModel({});
      // basic info
      proxyMapModel.title = fg.value.name;
      proxyMapModel.subtitle = fg.value.description;
      proxyMapModel.group = fg.value.group;
      proxyMapModel.kpi = <any>fg.value.kpi;
      proxyMapModel.dateRange = { predefined: fg.value.predefinedDateRange,
                                    custom: { from: fg.value.customFrom || null,
                                              to: fg.value.customTo || null  }};
      proxyMapModel.groupings = fg.value.grouping ? [fg.value.zipCodeSource, fg.value.grouping] : [fg.value.zipCodeSource];
      proxyMapModel.dashboards = fg.value.dashboards ? fg.value.dashboards.split('|').map(d => d.trim()) : [];
      proxyMapModel.size = fg.value.mapsize;
      proxyMapModel.zipCodeSource = fg.value.zipCodeSource;

      return proxyMapModel;
    }

    toMapFormValues(): IMapFormValues {
      return {
        // basic info
        name: this.title,
        description: this.subtitle || undefined,
        predefinedDateRange: this.dateRange ? this.dateRange.predefined : undefined,
        customFrom: (this.dateRange && this.dateRange.custom && this.dateRange.custom.from) ?
                    moment(this.dateRange.custom.from).format('MM/DD/YYYY') : undefined,
        customTo: (this.dateRange && this.dateRange.custom && this.dateRange.custom.to) ?
                    moment(this.dateRange.custom.to).format('MM/DD/YYYY') : undefined,
        grouping: this.groupings ? this.groupings || [] : [],
        kpi: this.kpi ? this.kpi || undefined : undefined,
        dashboards: this.dashboards ? this.dashboards.map(d => d).join('|') : undefined,
        mapsize: this.size,
        zipCodeSource: this.zipCodeSource ? this.zipCodeSource || undefined : undefined,
      };
    }

    constructor (obj: IMap | any) {
      Object.assign(this, obj);

      const that = this;
      /* setTimeout(() => {
        this.dateRange = this.dateRange ? this.dateRange[0] : this.dateRange;
      }, 0); */
    }

    get validForPreview(): boolean {
      return this.kpi !== undefined && this.kpi.length > 0 &&
             new ChartDateRangeModel(this.dateRange).valid;
    }

    get valid(): boolean {
      return this.title !== undefined && this.validForPreview;
    }
}

import { IChartDateRange } from '../../../shared/models';
import { IValueName } from '../../models/value-name';
import { ITaggable } from '../shared/taggable';

export enum KPITypeEnum {
    None = 0,
    Simple = 1,
    Complex = 2,
    Compound = 3,
    ExternalSource = 4
}

export interface IKPIFilter {
    order?: number;
    field: string;
    operator: string;
    criteria: string|string[];
    sourceValue?: string;
}

interface IKPIFormGroupSchema {
    name: string;
    group: string;
    description: string;
    source: string;
    predefinedDateRange: string;
    customFrom: string;
    customTo: string;
    frequency: string;
    aggFunction: string;
    aggField: string;
    operator: string;
    literal: string;
    groupings: string;
}

export interface ICriteriaResult {
  criteriaValue: string[];
}

export interface IKPICritera {
  kpiCriteria: ICriteriaResult;
}

export interface IKPISimpleDefinition {
    dataSource: string;
    function: string;
    field: string;
    operator?: string;
    value?: string;
}

export interface IKPI extends ITaggable {
    id?: string;
    _id?: string;
    code?: string;
    name: string;
    description?: string;
    group?: string;
    baseKpi?: string;
    groupings?: string[];
    groupingInfo?: IValueName[];
    dateRange?: IChartDateRange;
    filter?: any;
    frequency?: string;
    axisSelection?: string;
    emptyValueReplacement?: string;
    expression?: string;
    type?: string;
    source: string;
}

export class KPI implements IKPI {
    _id?: string;
    code: string;
    name: string;
    description?: string;
    group?: string;
    baseKpi?: string;
    groupings?: string[];
    dateRange?: IChartDateRange;
    filter?: any;
    frequency?: string;
    axisSelection?: string;
    emptyValueReplacement?: string;
    expression?: string;
    type?: string;
    tags: string[];
    source: string;
}

export class IKPIAttributes {
    code: string;
    name: string;
    baseKpi?: string;
    description?: string;
    group?: string;
    groupings?: string[];
    dateRange?: IChartDateRange;
    filter?: any;
    frequency?: string;
    axisSelection?: string;
    emptyValueReplacement?: string;
    expression?: string;
    type?: string;
}


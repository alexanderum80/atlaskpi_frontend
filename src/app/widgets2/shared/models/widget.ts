import { IChartDateRange } from './../../../shared/models/date-range';
export interface IWidget {
    name: string;
}

export interface INumericWidgetComparisonData {
    period?: string;
    value: number;
    arrowDirection?: string;
}

export interface INumericWidgetData {
    value?: number;
    format?: string;
    comparison?: INumericWidgetComparisonData;
}

export interface IWidgetViewData {
    name: string;
    description: string;
    size: string;
    color: string;
    format: string;

    chartWidgetData?: string;
    numericWidgetData?: INumericWidgetData;
}


import { IdName, IDateRangeItem } from '../../shared/models/index';

export interface IListChartResponse {
    listCharts: { data: any[] };
}

export interface IDateRangeResponse {
    dateRanges: IDateRangeItem[];
}

export interface IKpisResponse {
    kpis: IdName[];
}
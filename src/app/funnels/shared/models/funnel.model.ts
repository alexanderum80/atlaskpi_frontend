import { IChartDateRange } from '../../../shared/models';

export interface IFunnel {
    _id: string;
    order?: number;
    name: string;
    description?: string;
    kpi?: string;
    dateRange?: IChartDateRange;
    selectedFields?: string[];
    compareToStage?: string;
    foreground?: string;
    background?: string;
}

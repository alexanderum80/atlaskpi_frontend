import { IChartDateRange } from '../../../shared/models';

export interface IFunnel {
    _id: string;
    name: string;
    description?: string;
    stages: IFunnelStage[];
}

export interface IFunnelStage {
    order?: number;
    name?: string;
    kpi?: string;
    dateRange?: IChartDateRange;
    selectedFields?: string[];
    compareToStage?: string;
    foreground?: string;
    background?: string;
}

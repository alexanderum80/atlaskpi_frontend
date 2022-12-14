import { IChartDateRange } from '../../../shared/models';

export interface IFunnel {
    _id?: string;
    name: string;
    stages: IFunnelStage[];
    users: string[];

    createdBy?: string;
    updatedBy?: string;
    createdDate?: Date;
    updatedDate?: Date;
}

export interface IFunnelStage {
    _id?: string;
    order: number;
    name: string;
    kpi: string;
    dateRange: IChartDateRange;
    fieldsToProject?: string[];
    compareToStage?: string;
    foreground: string;
    background: string;
}

export interface IFunnelStageOptions {
    _id?: string;
    order?: number;
    name?: string;
    kpi?: string;
    dateRange?: IChartDateRange;
    fieldsToProject?: string[];
    compareToStage?: string;
    foreground?: string;
    background?: string;
}

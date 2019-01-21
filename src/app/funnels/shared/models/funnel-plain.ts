export interface IFunnel {
    _id: string;
    name: string;
    description?: string;
    stages: IFunnelStage[];
}

export interface IFunnelStage {
    order?: number;
    name?: string;
    description?: string;
    kpi?: string;
    selectedFields?: string[];
    compareToStage?: string;
    foreground?: string;
    background?: string;
}

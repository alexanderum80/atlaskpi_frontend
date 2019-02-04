export interface IRenderedFunnelStage {
    _id?: string;
    order: number;
    name: string;
    count: number;
    amount: number;
    compareToStageValue?: number;
    compareToStageName?: string;
    foreground: string;
    background: string;
}

export interface IRenderedFunnel {
    _id?: string;
    name: string;
    stages: IRenderedFunnelStage[];
}

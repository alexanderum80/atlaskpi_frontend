export enum EnumChartTop {
    TOP5 = 'top 5',
    TOP10 = 'top 10',
    TOP15 = 'top 15'
}

export const PredefinedTopNRecords = {
    top5: EnumChartTop.TOP5,
    top10: EnumChartTop.TOP10,
    top15: EnumChartTop.TOP15
};


export interface IChartTop {
    predefined: string;
    custom: number;
}

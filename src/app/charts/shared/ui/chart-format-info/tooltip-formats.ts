export interface IToolTipFormatDefinition {
    altas_definition_id: string;
    enabled?: boolean;
    useHTML?: boolean;
    shared?: boolean;
    pointFormat?: string;
    formatter?: string;
}

export interface IToolTipFormat {
    id: string;
    title: string;
    definition: IToolTipFormatDefinition;
}

export const TooltipFormats: IToolTipFormat[] = [
    {
        id: 'default',
        title: 'Default',
        definition: {
            altas_definition_id: 'default',
            enabled: true,
            useHTML: true,
            pointFormat: '<span style="color: {point.color}">\u25CF</span> {series.name}: <b class="highcharts-strong">{point.y:.2f}</b>'
        }
    },
    {
        id: 'multiple',
        title: 'Multiple',
        definition: {
            enabled: true,
            altas_definition_id: 'multiple',
            shared: true,
            useHTML: true,
            formatter: 'kpi_tooltip_total'
        }
    },
    {
        id: 'multiple_percent',
        title: 'Multiple with Percent',
        definition: {
            enabled: true,
            altas_definition_id: 'multiple_percent',
            shared: true,
            useHTML: true,
            formatter: 'kpi_tooltip_with_percentage_and_total'
        }
    },
    {
        id: 'pie_percent',
        title: 'Pie with Percent',
        definition: {
            altas_definition_id: 'pie_percent',
            enabled: true,
            pointFormat: '<b>{point.y:,.2f} ({point.percentage:.2f}%)</b>'
        }
    },
    {
        id: 'pie_total',
        title: 'Pie with Total',
        definition: {
            altas_definition_id: 'pie_total',
            enabled: true,
            shared: true,
            useHTML: true,
            formatter: 'kpi_tooltip_pie_with_total'
        }
    }, {
        id: 'pie_total_percent',
        title: 'Pie with Total and Percent',
        definition: {
            altas_definition_id: 'pie_total_percent',
            enabled: true,
            shared: true,
            useHTML: true,
            formatter: 'kpi_tooltip_pie_with_total_and_percent'
        }
    }
];

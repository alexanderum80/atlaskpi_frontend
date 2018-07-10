export function simplifyChartDefinition(definition: any) {
      // this method is only for making chart miniatures, do not use for displaying a chart preview
      definition.title = undefined;
      definition.subtitle = undefined;
      definition.exporting = definition.exporting || { };
      definition.exporting.enabled = false;
      definition.credits = { enabled: false };
      definition.legend = { enabled: false };
      definition.tooltip =  definition.tooltip || {};
      definition.tooltip.enabled = false;
      return definition;
}

export function reloadSeriesAndCategories(context, sampleChart) {
    // preserve series and categories
    const series = context.chartDefinition.series || null;
    const categories = context.chartDefinition.xAxis
                       ? context.chartDefinition.xAxis.categories || []
                       : [];
    const newDefinition = prepareChartDefinitionForPreview(sampleChart.sampleDefinition);

    // restore the series
    newDefinition.series = series;
    if (context.chartType !== 'pie') {
        newDefinition.xAxis =  Object.assign(newDefinition.xAxis || {}, { categories: categories });
    }

    // restore the serie colors
    if (context.chartDefinition.colors && context.chartDefinition.colors.length) {
        newDefinition.colors = context.chartDefinition.colors;
    }

    // apply definition
    context.chartDefinition = newDefinition;
}

export  function processChartActivityChange(context, chart, sampleChart) {
    context.chartType = String(chart.type);
    context.chartDefinition.chart.type = String(chart.type);

    // take off frequency and xAxis for pie Chart rendering
    if (context.chartType === 'pie' && context.fg.value['frequency'] !== '') {
        // need to deactivate frequency and xAxisSource and refetch Data
        context.backupChartModel = Object.assign({}, context.chartModel);
        context.fg.controls['frequency'].setValue('');
        context.fg.controls['xAxisSource'].setValue('');

        if (!context.backupChartModel.valid) {
            reloadSeriesAndCategories(context, sampleChart);
            return;
        }

        // bring the the chart from the backend
        context.previewChartQuery();
        return;
    }

    // if there is a backup of the ChartModel and the chart type changed from pie
    if (context.chartType !== 'pie' && context.backupChartModel) {
        // need to activate frequency and xAxisSource and refetch Data
        context.fg.controls['frequency'].setValue(context.backupChartModel.frequency);
        context.fg.controls['xAxisSource'].setValue(context.backupChartModel.xAxisSource);
        // assign value to empty object so valid property below does not force error
        context.backupChartModel = {};


        if (!context.backupChartModel.valid) {
            reloadSeriesAndCategories(context, sampleChart);
            return;
        }

        // bring the the chart from the backend
        context.previewChartQuery();
        return;
    }

    context.previewChartQuery();
    reloadSeriesAndCategories(context, sampleChart);
    context.backupChartModel = undefined;
}

export function prepareChartDefinitionForPreview(definition): any {
    const newDefinition = definition;

    // replace series and categories in the new definition
    // clean the definition of exporting buttons, title, and elements we don't need
    newDefinition.exporting = newDefinition.exporting || { };
    newDefinition.exporting.enabled = false;
    newDefinition.title = undefined;
    newDefinition.subtitle = undefined;

    // put altas kpi signature
    newDefinition.credits = {
        enabled: false,
        href: 'http://www.atlaskpi.com',
        text: 'Powered by AtlasKPI'
    };

    return newDefinition;
}

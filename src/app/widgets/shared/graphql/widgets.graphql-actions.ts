
export const widgetsGraphqlActions = {
    listWidgets: require('./list-widgets.query.gql'),
    listWidgetsNoData: require('./list-widgets-no-data.query.gql'),
    listWidgetCharts: require('./list-widget-charts.query.gql'),
    removeWidget: require('./remove-widget.mutation.gql'),
    previewWidget: require('./preview-widget.query.gql'),
    createWidget: require('./create-widget.mutation.gql'),
    updateWidget: require('./update-widget.mutation.gql'),
    widgetQuery: require('./widget.query.gql')
};

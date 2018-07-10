
export const widgetsGraphqlActions = {
    listWidgets: require('graphql-tag/loader!./list-widgets.query.gql'),
    listWidgetsNoData: require('graphql-tag/loader!./list-widgets-no-data.query.gql'),
    listWidgetCharts: require('graphql-tag/loader!./list-widget-charts.query.gql'),
    removeWidget: require('graphql-tag/loader!./remove-widget.mutation.gql'),
    previewWidget: require('graphql-tag/loader!./preview-widget.query.gql'),
    createWidget: require('graphql-tag/loader!./create-widget.mutation.gql'),
    updateWidget: require('graphql-tag/loader!./update-widget.mutation.gql'),
    widgetQuery: require('graphql-tag/loader!./widget.query.gql')
};

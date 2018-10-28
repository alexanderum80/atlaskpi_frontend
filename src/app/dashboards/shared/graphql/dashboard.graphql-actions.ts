import { DashboardsComponent } from '../../dashboards.component';

export const dashboardGraphqlActions = {
    allDashboard: require('graphql-tag/loader!./all-dashboard.query.gql'),
    listCharts: require('graphql-tag/loader!./list-charts.query.gql'),
    createDashboard: require('graphql-tag/loader!./create-dashboard.gql'),
    dashboard: require('graphql-tag/loader!./dashboard.gql'),
    deleteDashboard: require('graphql-tag/loader!./delete-dashboard.gql'),
    updateDashboard: require('graphql-tag/loader!./update-dashboard.gql'),
    previewDashboard: require('graphql-tag/loader!./preview-dashboard.query.gql'),
    deleteChartIdFromDashboard: require('graphql-tag/loader!./delete-chartId-from-dashboard.gql')
};

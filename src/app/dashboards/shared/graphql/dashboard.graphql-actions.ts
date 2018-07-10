import { DashboardsComponent } from '../../dashboards.component';

export const dashboardGraphqlActions = {
    allDashboard: require('./all-dashboard.query.gql'),
    listCharts: require('./list-charts.query.gql'),
    createDashboard: require('./create-dashboard.gql'),
    dashboard: require('./dashboard.gql'),
    deleteDashboard: require('./delete-dashboard.gql'),
    updateDashboard: require('./update-dashboard.gql'),
    previewDashboard: require('./preview-dashboard.query.gql')
};

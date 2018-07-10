

export const userApi = {
    all: require('graphql-tag/loader!../graphql/get-users.query.gql'),
    current: require('graphql-tag/loader!../graphql/get-user.query.gql')
};

export const targetApi = {
    remove: require('graphql-tag/loader!../graphql/remove-target.mutation.gql'),
    removeTargetFromChart: require('graphql-tag/loader!../graphql/remove-target-from-chart.mutation.gql'),
    current: require('graphql-tag/loader!../graphql/get-target.query.gql'),
    all: require('graphql-tag/loader!../graphql/get-all-targets.query.gql')
};

export const chartApi = {
    read: require('graphql-tag/loader!../graphql/read-chart.query.gql')
};

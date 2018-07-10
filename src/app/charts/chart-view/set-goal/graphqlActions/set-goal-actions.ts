

export const userApi = {
    all: require('../graphql/get-users.query.gql'),
    current: require('../graphql/get-user.query.gql')
};

export const targetApi = {
    remove: require('../graphql/remove-target.mutation.gql'),
    removeTargetFromChart: require('../graphql/remove-target-from-chart.mutation.gql'),
    current: require('../graphql/get-target.query.gql'),
    all: require('../graphql/get-all-targets.query.gql')
};

export const chartApi = {
    read: require('../graphql/read-chart.query.gql')
};

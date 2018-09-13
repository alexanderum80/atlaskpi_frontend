

export const userApi = {
    all: require('graphql-tag/loader!./get-users.query.gql'),
    current: require('graphql-tag/loader!./get-user.query.gql')
};

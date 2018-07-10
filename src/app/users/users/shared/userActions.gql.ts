

export const usersApi = {
    all: require('graphql-tag/loader!../graphql/user/read-users.query.gql'),
    current: require('graphql-tag/loader!../graphql/user/read-user.query.gql'),
    delete: require('graphql-tag/loader!../graphql/user/delete-user.mutation.gql')
};

export const rolesApi = {
    all: require('graphql-tag/loader!../graphql/role/get-roles.query.gql')
};

export const permissionsApi = {
    all: require('graphql-tag/loader!../graphql/permission/get-permissions.query.gql')
};

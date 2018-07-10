

export const usersApi = {
    all: require('../graphql/user/read-users.query.gql'),
    current: require('../graphql/user/read-user.query.gql'),
    delete: require('../graphql/user/delete-user.mutation.gql')
};

export const rolesApi = {
    all: require('../graphql/role/get-roles.query.gql')
};

export const permissionsApi = {
    all: require('../graphql/permission/get-permissions.query.gql')
};



export const permissionsApi = {
    all: require('graphql-tag/loader!../graphql/read-permissions.graphql')
};

export const roleSharedApi = {
    delete: require('graphql-tag/loader!../graphql/remove-role.graphql')
};

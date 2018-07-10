

export const rolesApi = {
  all: require('graphql-tag/loader!../graphql/get-roles.query.gql'),
  update: require('graphql-tag/loader!../graphql/update-role.mutation.gql'),
  delete: require('graphql-tag/loader!../graphql/delete-role.mutation.gql')
};

export const permissionApi = {
  read: require('graphql-tag/loader!../graphql/permission/get-permission.query.gql')
};

export const usersApi = {
  all: require('graphql-tag/loader!../graphql/user/get-user.query.gql')
};

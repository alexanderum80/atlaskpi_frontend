

export const rolesApi = {
  all: require('../graphql/get-roles.query.gql'),
  update: require('../graphql/update-role.mutation.gql'),
  delete: require('../graphql/delete-role.mutation.gql')
};

export const permissionApi = {
  read: require('../graphql/permission/get-permission.query.gql')
};

export const usersApi = {
  all: require('../graphql/user/get-user.query.gql')
};

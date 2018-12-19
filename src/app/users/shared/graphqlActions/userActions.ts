
export const usersApi = {
    search: require('graphql-tag/loader!../graphql/search-users.gql'),
    resetPassword: require('graphql-tag/loader!../graphql/reset-password.gql'),
    forgotPassword: require('graphql-tag/loader!../graphql/user-forgot-password.gql'),
    verifyEnrollmentToken: require('graphql-tag/loader!../graphql/verify-enrollment-token.gql'),
    verifyResetPasswordToken: require('graphql-tag/loader!../graphql/verify-reset-password-token.gql'),
    create: require('graphql-tag/loader!../graphql/create-user.gql'),
    read: require('graphql-tag/loader!../graphql/get-user.gql'),
    delete: require('graphql-tag/loader!../graphql/remove-user.gql'),
    update: require('graphql-tag/loader!../graphql/update-user.gql'),
    all: require('graphql-tag/loader!../graphql/get-all-users.gql'),
    assignDash: require('graphql-tag/loader!../graphql/adduser-dashboard.gql')
};

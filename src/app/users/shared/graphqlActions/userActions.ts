
export const usersApi = {
    search: require('../graphql/search-users.gql'),
    resetPassword: require('../graphql/reset-password.gql'),
    forgotPassword: require('../graphql/user-forgot-password.gql'),
    verifyEnrollmentToken: require('../graphql/verify-enrollment-token.gql'),
    verifyResetPasswordToken: require('../graphql/verify-reset-password-token.gql'),
    create: require('../graphql/create-user.gql'),
    read: require('../graphql/get-user.gql'),
    delete: require('../graphql/remove-user.gql'),
    update: require('../graphql/update-user.gql'),
    all: require('../graphql/get-all-users.gql')
};

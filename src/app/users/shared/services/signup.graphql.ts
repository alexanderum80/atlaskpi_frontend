import gql from 'graphql-tag';

export const accountGraphQl = {
    createAccount: gql`
        mutation CreateAccount($details: AccountDetails) {
            createAccount(account: $details) {
                entity {
                    _id
                    name
                    personalInfo {
                        fullname
                        email
                        timezone
                    }
                    initialToken {
                        issued
                        expires
                        access_token
                    }
                    subdomain
                }
                errors {
                    field
                    errors
                }
            }
        }
    `,

    accountNameAvailable: gql`
       query AccountNameAvailable($name: String!) {
            accountNameAvailable(name:$name)
        }
    `,
};

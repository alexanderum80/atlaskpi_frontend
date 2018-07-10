import gql from 'graphql-tag';

export const industriesGraphQl = {
    industries: gql`
        query Industries {
            industries {
                _id
                name
                subIndustries
                {
                    _id
                    name
                }
            }
        }
    `,
};

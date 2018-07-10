import { Apollo } from 'apollo-angular';
import {
    Injectable
} from '@angular/core';
import {
    Promise
} from 'bluebird';
import {
    DocumentNode
} from 'graphql';


export interface IApolloMutationVariables {
    [key: string]: any;
}

export interface IApolloMutationOptions {
    mutation: DocumentNode;
    variables?: IApolloMutationVariables;
    refetchQueries?: string[];
}

@Injectable()
export class ApolloService {

    constructor(private _apollo: Apollo) {}

    networkQuery <T> (query: any, variables?: any): Promise <T> {
        const that = this;
        const queryDetails: any = {
            query: query,
            fetchPolicy: 'network-only'
        };

        if (variables) {
            queryDetails.variables = variables;
        }
        return this._apollo.query <T> (queryDetails)
        .toPromise()
        .then(r => {
             return r.data;
        });
    }

    mutation <T> (mutation: any, variables?: any, refetchQueries?: string[]): Promise<T> {
        const definition: IApolloMutationOptions = {
            mutation: mutation,
            variables: null
        };

        if (variables) {
            definition.variables = variables;
        }

        if (refetchQueries) {
            definition.refetchQueries = refetchQueries;
        }

        return this._apollo.mutate <T> (definition)
            .toPromise();
    }
}

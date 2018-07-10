import { Injectable } from '@angular/core';
import { ApolloQueryResult } from 'apollo-client';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { IMutationResponse, IAccountDetails} from '../../../shared/models';
import { Apollo, QueryRef } from 'apollo-angular';
import { accountGraphQl } from './signup.graphql';


@Injectable()
export class SignupService {
    nameAvailabilityWatchQuery: QueryRef<any>;

    private _nameAvailableSubject = new Subject<boolean>();
    private _accountSubject = new Subject<IMutationResponse>();

    constructor(public _apollo: Apollo) {
        this.nameAvailabilityWatchQuery = this._apollo.watchQuery({
            query: accountGraphQl.accountNameAvailable,
            variables: { name: '' },
            fetchPolicy: 'network-only'
        });

        const that = this;

        this.nameAvailabilityWatchQuery.valueChanges.subscribe((res) =>
            that._nameAvailableSubject.next(res.data.accountNameAvailable)
        );
    }

    verifyNameAvailability(name: string) {
        const that = this;

        this.nameAvailabilityWatchQuery.refetch({ name }).then(res => {
            that._nameAvailableSubject.next(res.data.accountNameAvailable);
        });
    }

    get accountNameAvailable$(): Observable<boolean> {
        return this._nameAvailableSubject.asObservable();
    }

    createAccount(details: IAccountDetails): Observable<IMutationResponse> {
        this._apollo.mutate({
            mutation: accountGraphQl.createAccount, variables: { details: details }
        })
        .toPromise()
        .then((response) => {
            this._accountSubject.next({ errors: (<any>response.data).createAccount.errors,
                                        entity: (<any>response.data).createAccount.entity  });
        }, (err) => {
            this._accountSubject.next({ errors: [
                { field: '', errors: ['There was an error creating this account'] }
            ]});
        });
        return this._accountSubject.asObservable();
    }
}

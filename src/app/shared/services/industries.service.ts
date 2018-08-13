import { ApolloQueryResult } from 'apollo-client';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { industriesGraphQl } from './industries.graphql';
import { Industry } from '../models';

@Injectable()
export class IndustriesService {
    industriesWatchQuery: QueryRef<any>;

    private _industriesSubject = new Subject<Industry[]>();

    constructor(public _apollo: Apollo) {
        this.industriesWatchQuery = this._apollo.watchQuery({
            query: industriesGraphQl.industries,
            fetchPolicy: 'network-only'
        });

        const that = this;

        this.industriesWatchQuery.valueChanges.subscribe((res) =>
            that._industriesSubject.next(res.data.industries)
        );
    }

    get industries$(): Observable<Industry[]> {
        return this._industriesSubject.asObservable();
    }
}

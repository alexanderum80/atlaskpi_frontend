import { ApolloQueryResult } from 'apollo-client';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { IPaginationDetails, PaginationDetailsDefault } from '../models';
import gql from 'graphql-tag';

export class GraphQLService<T> {
    watchQueryObservable: QueryRef<ApolloQueryResult<T>>;
    paginationDetailsSubject: Subject<IPaginationDetails> = new Subject<IPaginationDetails>();

    private _storeSubject = new Subject<T[]>();

    get store$(): Observable<T[]> {
        return this._storeSubject.asObservable();
    }

    constructor(
        public apollo: Apollo,
        private query: string,
        private map: (value: any, index: number) => any) {
    }

    initQuery(variables: any) {
        this.watchQueryObservable =
        this.apollo.watchQuery<ApolloQueryResult<T>>({
            query: gql`${this.query}`,
            variables: variables,
            fetchPolicy: 'cache-and-network'
        });

        const that = this;

        this.watchQueryObservable
            .valueChanges
            .map(this.map)
            .subscribe((data) => that._storeSubject.next(data));
    }


   search(pagination?: IPaginationDetails): void {
      if (!pagination) { pagination = PaginationDetailsDefault; };
      this.paginationDetailsSubject.next(pagination);
   }

   refetch() {
       this.watchQueryObservable.refetch();
   }
}

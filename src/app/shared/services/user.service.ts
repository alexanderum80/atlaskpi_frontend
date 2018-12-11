import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { isBoolean } from 'lodash';

import { IUserProfile } from '../../users/shared/models';
import { IManageUsers } from '../../users/shared/models/user';
import { IUserInfo, IUserAgreement, User } from '../models';
import { Store } from './store.service';

const usersApi = {
    all: require('graphql-tag/loader!../../users/shared/graphql/get-all-users.gql'),
    current: require('graphql-tag/loader!../../users/shared/graphql/current-user.gql')
};

export interface IUserInfoResponse {
    User: IUserInfo;
}

@Injectable()
export class UserService {

    private _user: IUserInfo;
    private users: IManageUsers;
    private allowAction: boolean;

    private _userSubject = new BehaviorSubject<IUserInfo>(null);
    private _allUserSubject = new BehaviorSubject<IManageUsers>(null);

    private _subscription: Subscription[] = [];

    currentUserQuery: QueryRef<any>;

    constructor(
        private _store: Store,
        private _apollo: Apollo
    ) { }

    get user(): IUserInfo {
        return this._user;
    }

    get user$(): Observable<IUserInfo> {
        return this._userSubject.asObservable();
    }

    get subscription(): Subscription[] {
        return this._subscription;
    }

    unsubscribe(): void {
        this._subscription.forEach(s => {
            if (s && !s.closed && (typeof s.unsubscribe === 'function')) {
                s.unsubscribe();
            }
        });
    }

    updateUserInfo(userLoggedIn: boolean): void {
        if (!userLoggedIn) {
            return this._userSubject.next(null);
        }

        const that = this;

        if (!this.currentUserQuery) {
            this.currentUserQuery = this._apollo.watchQuery<ApolloQueryResult<IUserInfo>>({
                query: usersApi.current,
                fetchPolicy: 'network-only'
            });

            this._subscription.push(this.currentUserQuery.valueChanges.subscribe(({data}) => {
                that._setUser(data);
            }));
        } else {
            if (!this._userSubject.value) {
                this.currentUserQuery.refetch().then(({ data }) => {
                    that._setUser(data);
                });
            }
        }
    }

    removeUser() {
        this._user = null;
        this._userSubject.next(this._user);
    }

    hasPermission(action, subject): boolean {
        const that = this;
        const currentUser = this._userSubject.value;

        if (!currentUser) { return false; }

        const isOwner = currentUser.roles.find(role => (<any>role).name === 'owner');
        if (isOwner) {
            that.allowAction = true;
        } else {
                const has = currentUser.roles.find(role => {
                    return (<any>role).permissions.find(perm => {
                        return (perm.action === action) && (perm.subject === subject);
                });
            });
            that.allowAction = has ? true : false;
        }

        return this.allowAction;
    }

    private _setUser(data: { User: User}): void {
        if (!data || !data.User) { return; }
        this._user = new User(data.User);
        this._userSubject.next(this._user);
    }

}

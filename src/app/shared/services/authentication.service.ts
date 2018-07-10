import { StoreHelper } from './index';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { isBoolean } from 'lodash';

import { environment } from '../../../environments/environment';
import { IAuthCredentials, UserToken } from '../models';
import { LocalStorageService } from './local-storage.service';
import { NativeChannelService } from './native-channel.service';
import { UserService } from './user.service';

@Injectable()
export class AuthenticationService {
    private _authenticatedSubject = new BehaviorSubject <boolean> (false);

    private _owner: boolean;
    private _ownerSubject = new BehaviorSubject<boolean>(this._owner);

    constructor(private _http: Http,
        private _router: Router,
        private _userSvc: UserService,
        private _localStorageSvc: LocalStorageService,
        private _nativeChannelSvc: NativeChannelService,
        private _storeHelper: StoreHelper,
        private _apollo: Apollo) {
        this._updateAuthorizationOnStartup();
    }

    get authenticated(): boolean {
        return this._authenticatedSubject.getValue();
    }

    get owner(): boolean {
        return this._owner;
    }

    get owner$(): Observable<boolean> {
        return this._ownerSubject.asObservable().distinctUntilChanged();
    }

    setOwner(isOwner: boolean): void {
        if (!isBoolean(isOwner)) {
            return;
        }

        this._owner = isOwner;
        this._ownerSubject.next(isOwner);
    }

    login(credentials: IAuthCredentials): Observable < boolean > {
        if (credentials.host) {
            credentials.host = credentials.host.toLowerCase();
        }

        // put the host on the credentials object
        if (!credentials['host']) {
            credentials['host'] = location.hostname.toLowerCase();
        }
        // add the subdimain if it wasn't specified
        if (credentials['host'].split('.').length < 2) {
            credentials['host'] += `.${environment.subdomain}`.toLowerCase();
        }

        credentials['grant_type'] = 'password';
        const headers = new Headers({
            'Content-Type': 'application/json'
        });
        const options = new RequestOptions({
            headers: headers
        });
        return this._http.post(environment.restServer + '/auth/token',
                JSON.stringify(credentials),
                options)
            .map((response: Response) => {
                const jsonToken = new UserToken(response.json());

                if (jsonToken && jsonToken.access_token) {
                    this._localStorageSvc.userToken = jsonToken;
                    this._localStorageSvc.updateCompanyInfo(jsonToken);
                    this._authenticated = true;
                    return true;
                }

                this._authenticated = false;
                return false;
            });
    }

    logout(navigate = true): void {
        if (navigate) {
            this._router.navigate(['start']);
        }

        this._localStorageSvc.removeUserToken();
        this._authenticated = false;

        if (this._storeHelper && this._storeHelper.findAndUpdate) {
            this._storeHelper.update('showAppointmentCancelled', null);
            this._storeHelper.update('selectedAppointmentsProvider', null);
        }
        this._userSvc.unsubscribe();
    }

    setInitialToken(res: any, redirect = true) {
        const userToken = new UserToken(res);
        this._localStorageSvc.userToken = userToken;
        this._authenticated = true;
        if (redirect) {
            setTimeout(() => {
                this._router.navigate(['dashboards']);
            }, 500);
        }
    }

    get authenticated$(): Observable < boolean > {
        return this._authenticatedSubject.asObservable().distinctUntilChanged();
    }

    private set _authenticated(authenticated: boolean) {
        this._authenticatedSubject.next(authenticated);
        this._userSvc.updateUserInfo(authenticated);

        if (authenticated) {
            this._nativeChannelSvc.setUserToken(this._localStorageSvc.userToken.access_token);
        } else {
            this._nativeChannelSvc.removeUserToken();
        }
    }

    private _updateAuthorizationOnStartup(): void {
        const jsonToken = this._localStorageSvc.userToken;
        const authenticated = jsonToken !== undefined && !jsonToken.expires.isBefore(moment());

        this._authenticated = authenticated;
    }
}

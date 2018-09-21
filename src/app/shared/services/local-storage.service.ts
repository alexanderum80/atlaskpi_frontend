import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { IUserToken, UserToken } from '../models/user-token';
import { IVersion } from '../models/version';

const StorageKeys = {
    VERSION: 'version',
    COMPANY_INFO: 'companyInfo'
};

export interface ICompanyInfo {
    subdomain: string;
    companyName: string;
    email: string;
    fullName: string;
}

@Injectable()
export class LocalStorageService {

    get userToken(): IUserToken {
        let userToken: IUserToken;
        try {
            const tokenString = localStorage.getItem(environment.BEARER_KEY);
            if (tokenString) {
                userToken = new UserToken(JSON.parse(tokenString));
            }
        } catch (err) {
            console.log(err);
            return null;
        }

        return userToken;
    }

    set userToken(token: IUserToken) {
        const tokenString = JSON.stringify(token);
        localStorage.setItem(environment.BEARER_KEY, tokenString);
    }

    removeUserToken() {
        localStorage.removeItem(environment.BEARER_KEY);
    }

    updateCompanyInfo(userToken: IUserToken) {
        if (!userToken) {
            return;
        }

        localStorage.setItem(StorageKeys.COMPANY_INFO, JSON.stringify(userToken.companyInfo));
    }

    getCompanyInfo(): ICompanyInfo {
        const companyInfo = localStorage.getItem(StorageKeys.COMPANY_INFO);
        return  companyInfo ? JSON.parse(companyInfo) : null;
    }

    getVersion(): IVersion {
        const version = localStorage.getItem(StorageKeys.VERSION);
        return version ? JSON.parse(version) : null;
    }

}
import { Injectable } from '@angular/core';
import { IAuthCredentials } from '../models';
import { ICompanyInfo } from './local-storage.service';

@Injectable()
export class NativeChannelService {

    callPhoneNumber(phoneNumber: string) {
        this._postMessage(`tel://${phoneNumber}`);
    }

    setUserToken(token: string) {
        this._postMessage(`setToken:${token}`);
    }

    removeUserToken() {
        this._postMessage(`setToken:`);
    }

    logoff() {
        console.log('Logging user off');
        this._postMessage('logoff');
    }

    sendCredentials(credentials: IAuthCredentials) {
        if (!credentials) {
            return;
        }

        this._postMessage(`sendCredentials:${JSON.stringify(credentials)}`);
    }

    loginRequired(companyInfo: ICompanyInfo) {
        this._postMessage(`loginRequired:${JSON.stringify(companyInfo)}`);
    }

    private _postMessage(message: string) {
        try {
            const w = (<any>window);

            // ios
            if (w.webkit) {
                w.webkit.messageHandlers.callbackHandler.postMessage(message);
            }

            // android
            if (w.Android) {
                w.Android.postMessage(message);
            }

        } catch (err) {
            console.log('error');
        }
    }
}

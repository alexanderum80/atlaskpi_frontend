import { Injectable } from '@angular/core';

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

    private _postMessage(message: string) {
        try {
            let w = (<any>window);

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

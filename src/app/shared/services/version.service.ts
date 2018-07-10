import { IVersion } from '../models/version';
import { Subject } from 'rxjs/Subject';
import { Http } from '@angular/http';
import {
    LocalStorageService
} from './local-storage.service';
import {
    Injectable
} from '@angular/core';

@Injectable()
export class VersionService {
    private _newVersionAvailableSubject: Subject<IVersion>;

    constructor(
        private _localStorageSvc: LocalStorageService,
        private _http: Http) {
            this._newVersionAvailableSubject = new Subject<IVersion>();
        }

    checkVersionNumber() {
        const that = this;

        this._http.get('/assets/version.json').toPromise().then(response => {

            const rawVersion = response.text();
            const serverVersion = rawVersion ? JSON.parse(response.text()) : null;
            const runningVersion = that._localStorageSvc.getVersion();

            console.log(`client: ${runningVersion.number}, server: ${serverVersion.number}`);

            if (runningVersion && serverVersion && runningVersion.number < serverVersion.number) {
                this._newVersionAvailableSubject.next(serverVersion);
            }
        });
    }

    get newVersionAvailable$() {
        return this._newVersionAvailableSubject.asObservable();
    }

}

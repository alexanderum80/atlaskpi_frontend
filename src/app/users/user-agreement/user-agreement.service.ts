import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { isBoolean } from 'lodash';

@Injectable()
export class UserAgreementService {
    private _ownerAgreed: boolean;
    private _ownerAgreedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this._ownerAgreed);


    get ownerAgreed$(): Observable<boolean> {
        return this._ownerAgreedSubject.asObservable();
    }

    get ownerAgreed(): boolean {
        return this._ownerAgreedSubject.getValue();
    }

    setOwnerAgreed(agreed: boolean): void {
        if (!isBoolean(agreed)) {
            return;
        }

        this._ownerAgreed = agreed;
        this._ownerAgreedSubject.next(this._ownerAgreed);
    }
}

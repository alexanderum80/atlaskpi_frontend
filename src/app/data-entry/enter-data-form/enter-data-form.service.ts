import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IDataChanged {
    _id: string;
    [key: string]: any;
}

@Injectable()
export class EnterDataFormService {
    private _changesSubject = new BehaviorSubject<IDataChanged[]>([]);

    get changes$() {
        return this._changesSubject.asObservable();
    }

    get hasChanges() {
        return this._changesSubject.value.length > 0;
    }

    registerChange(change: IDataChanged): any {
        let changes = this._changesSubject.value;
        const changeExist = changes.find(c => c._id === change._id);

        if (!changeExist) {
            changes = [...changes, change];
            this._changesSubject.next(changes);
        }
    }

}

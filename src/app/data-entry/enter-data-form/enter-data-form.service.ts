import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IDataChanged {
    _id: string;
    [key: string]: any;
}

export interface IDataColumn {
    dataType: string;
    path: string;
    required: boolean;
    sourceOrigin: string;
}

export interface IDataSchema {
    [key: string]: IDataColumn;
}

export interface IDataEntryResponse {
    customLists: any[];
    data: any[];
    dataName: string;
    dateRangeField: string;
    name: string;
    schema: IDataSchema;
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

    get registeredChanges(): IDataChanged[] {
        return this._changesSubject.value;
    }

    registerChange(change: IDataChanged): any {
        let changes = this._changesSubject.value;
        const changeExist = changes.find(c => c._id === change._id);

        if (!changeExist) {
            changes = [...changes, change];
            this._changesSubject.next(changes);
        }
    }

    prepareRecords(res: IDataEntryResponse, quantity = 1000) {
        const records = [...res.data];
        const emptyRecord = this.getEmptyRecord(res.schema);

        for (let i = 0; i < quantity; i++) {
            records.push({ ...emptyRecord });
        }

        return records;
    }

    private getEmptyRecord(schema: IDataSchema) {
        const res = {};

        for (const [key, value] of Object.entries(schema)) {
            res[value.path] = '';
        }

        return res;
    }

}

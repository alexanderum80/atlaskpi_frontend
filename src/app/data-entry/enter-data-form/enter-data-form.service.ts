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

    columnDefs: any[];
    rowData: any[];

    private res: IDataEntryResponse;
    private _changesSubject = new BehaviorSubject<IDataChanged[]>([]);

    registerDataSource(res: IDataEntryResponse): any {
        this.res = res;
        this.columnDefs = this.prepareColumns(res);
        this.rowData = this.prepareRecords(res);
    }

    get name() {
        return this.res.name;
    }

    get changes$() {
        return this._changesSubject.asObservable();
    }

    get hasChanges() {
        return this._changesSubject.value.length > 0;
    }

    get registeredChanges(): IDataChanged[] {
        return this._changesSubject.value;
    }

    registerChange(change: any): any {
        this.applyValueDataType(change);

        let changes = this._changesSubject.value;
        const changeExist = changes.find(c => c._id === change.data._id);

        if (!changeExist) {
            changes = [...changes, change.data];
            this._changesSubject.next(changes);
        }
    }

    private prepareRecords(res: IDataEntryResponse, quantity = 1000) {
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

    private prepareColumns(res: IDataEntryResponse): any[] {
        const columns = [];

        for (const [key, value] of Object.entries(res.schema)) {

            if (key !== 'Source') {
                const columnDef: any = {
                    headerName: key,
                    field: value.path,
                    filter: this.getColumnFilter(value.dataType),
                };

                // check for numeric columns
                if (value.dataType === 'Numeric') {
                    columnDef.type = 'numericColumn';
                }

                if (value.sourceOrigin) {
                    const customList = res.customLists.find(l => l._id === value.sourceOrigin);
                    columnDef.cellEditor = 'agSelectCellEditor';
                    columnDef.cellEditorParams = {
                        values: customList.listValue
                    };
                }

                columns.push(columnDef);
            }
        }

        return columns;
    }

    private getColumnFilter(dataType: string) {
        switch (dataType) {
            case 'String':
                return 'agTextColumnFilter';
            case 'Numeric':
                return 'agNumberColumnFilter';
            case 'Date':
                return 'agDateColumnFilter';
            default:
                break;
        }
    }

    private applyValueDataType(change: any): any {
        const fieldName = change.colDef.field;
        const fieldDefinition = this.getField(fieldName);
        let newValue = change.value;

        switch (fieldDefinition.dataType) {
            case 'String':
                newValue = String(change.value);
                break;
            case 'Number':
                newValue = Number(change.value);
                break;
            case 'Date':
                newValue = new Date(change.value);
                break;

            default:
                break;
        }

        change.data[fieldName] = newValue;
    }

    private getField(name: string) {
        let field;

        for (const [key, value] of Object.entries(this.res.schema)) {
            if (value.path === name) {
                field = value;
                break;
            }
        }

        return field;
    }

}

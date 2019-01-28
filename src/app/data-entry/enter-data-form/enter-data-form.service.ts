import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isEmpty } from 'lodash';

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
        this._changesSubject.next([]);
    }

    get schema() {
        return this.res.schema;
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
        //this.applyValueDataType(change);
        let changes = this._changesSubject.value;

        const changeExist = changes.find(c => c === change.data);

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
                    valueSetter: (params) => {
                        return this.applyValueDataType(params);
                    }
                };

                // check for numeric columns
                if (value.dataType === 'Number') {
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
            case 'Number':
                return 'agNumberColumnFilter';
            case 'Date':
                return 'agDateColumnFilter';
            case 'Boolean':
                return true;
            default:
                break;
        }
    }

    private applyValueDataType(change: any): any {
        const fieldName = change.colDef.field;
        const fieldDefinition = this.getField(fieldName);
        let newValue = change.newValue;
        

        //- no change or empty in a required field
        if( change.newValue === String(change.oldValue) ||
            (fieldDefinition.required && newValue === "" )){
            return false;
        }

        switch (fieldDefinition.dataType) {
            case 'String':
                newValue = String(newValue);
                break;
            case 'Number':
                newValue = Number(newValue);
                if(isNaN(newValue)){
                    return false;
                }
                break;
            case 'Date':
                newValue = new Date(newValue);
                if(isNaN(newValue.getTime() )){
                    return false;
                }
                break;
            case 'Boolean':
                let temp;
                newValue = newValue.toLowerCase();
                temp = newValue === "true" || newValue === "false";

                if(!temp){
                    //- not required and is empty
                    if(newValue == "") {
                        newValue = null;
                    } 
                    //- other value Eg. newValue: "not boolean"
                    else{  return false; }
                } 
                //- is a valid boolean string
                else{
                    newValue = (newValue === "true");
                }
                break;
            default:
                break;
        }

        change.data[fieldName] = newValue;
        return true;
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

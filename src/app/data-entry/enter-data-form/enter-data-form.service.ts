import { isBoolean, isString } from 'lodash';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
import { ApolloService } from 'src/app/shared/services/apollo.service';
import SweetAlert from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { getDatePicker } from './datepicker-editor';

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

export enum savingStatus {
    ready = 'Ready',
    saving = 'Saving...',
    saved = 'All changes have been saved!'
}

const updateDataEntryMutation = require('graphql-tag/loader!../shared/graphql/update-data-entry.gql');

@Injectable()
export class EnterDataFormService {

    columnDefs: any[];
    rowData: any[];
    initialRecords = 0;
    dateFieldPath: string;
    status: string = savingStatus.ready;

    dateComponent = {
        'datePicker': getDatePicker()
    };

    requiredStyle = {
        style: '',
        asterisk: ''
    };

    private res: IDataEntryResponse;
    private _changesSubject = new BehaviorSubject<IDataChanged[]>([]);

    private _recordsCount = new BehaviorSubject<number>(0);

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _apolloService: ApolloService,
    ) {}

    registerDataSource(res: IDataEntryResponse): any {
        this.status = savingStatus.ready;
        this.res = res;
        this.dateFieldPath = res.dateRangeField;
        this.initialRecords = res.data.length;
        this._recordsCount.next(this.initialRecords);
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

    get recordsCount$() {
        return this._recordsCount.asObservable();
    }

    get hasChanges() {
        return this._changesSubject.value.length > 0;
    }

    get registeredChanges(): IDataChanged[] {
        return this._changesSubject.value;
    }

    countChanged(num: number) {
        if (num > 0 && this._recordsCount.value > 0) {
            this._recordsCount.next(
                this._recordsCount.value - num
            );
        }
    }

    registerChange(change: any): any {
        // this.applyValueDataType(change);
        let changes = this._changesSubject.value;
        const changeExist = changes && changes.find(c => c === change.data);

        if (!changeExist) {
            changes = [...changes, change.data];
           this._changesSubject.next(changes);
        }

        // - check validity of row
        const rowData = change.data;
        const rowNode = change.node;
        const isRowValid = this.isRowValid(rowData);
        if (isRowValid) {
            this.status = savingStatus.saving;
            rowData.source = 'Manual entry';
            this._apolloService.mutation<any>(
                updateDataEntryMutation,
                {
                    id: this._route.snapshot.params.id,
                    input: JSON.stringify([rowData])
                },
                ['DataEntries']
                )
                .then(result => {
                    if (result.data.updateDataEntry.success) {
                        const resultEntity = JSON.parse(result.data.updateDataEntry.entity);

                        // - prevents duplicates, when we update we create a new doc
                        rowData._id = resultEntity._id;
                        rowNode.setData(rowData);
                        // - reset subject
                        this._changesSubject.next([]);
                        this.status = savingStatus.saved;
                    }
                })
                .catch(err => console.log('Server errors: ' + JSON.stringify(err)));
            }
    }

    private prepareRecords(res: IDataEntryResponse, quantity = 1000) {
        const records = [...res.data];

        // - [fieldName : string, fieldDefinition: Object]
        const dateFieldsRaw = Object.entries(this.schema).filter(([key, value]) => value.dataType === 'Date');

        if (records.length && dateFieldsRaw.length) {

            const dateFieldsArr = dateFieldsRaw.map(val => val[1].path);

            dateFieldsArr.forEach(dateField => {
                records.map(rec => {
                        // const date = new Date(rec[dateField])
                        // const userOffset = date.getTimezoneOffset()*60000;
                        // rec[dateField] =  new Date( date.getTime() + userOffset)
                        const date = new Date(rec[dateField]);
                        rec[dateField] =  date;
                    });
            });

        }

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
        // -index column
        const columns = [
            {
                headerName: 'ID',
                width: 130,
                // it is important to have node.id here, so that when the id changes (which happens
                // when the row is loaded) then the cell is refreshed.
                valueGetter: '+node.id + 1',
                // cellRenderer: 'loadingRenderer',      /*giving a warning in the console */
                type: 'numericColumn',
                editable: false,
                filter: 'agNumberColumnFilter',
                checkboxSelection: true,
                // comparator: (valueA, valueB, nodeA, nodeB) => {
                //   return this.ignoreEmptyRecordsComparator(valueA, valueB, nodeA, nodeB)
                // }
            }];

        for (const [key, value] of Object.entries(res.schema)) {

            if (value.required || value.path === this.dateFieldPath) {
                this.requiredStyle.style = `style="color: #E41736"`;
                this.requiredStyle.asterisk = `<span style="padding-left: 3px; padding-right: 3px; color: red">*</span>`;
            } else {
                this.requiredStyle.style = '';
                this.requiredStyle.asterisk = '';
            }
            if (key !== 'Source') {
                const columnDef: any = {
                    headerName: key,
                    field: value.path,
                    comparator: (valueA, valueB, nodeA, nodeB) => {
                        return this.ignoreEmptyRecordsComparator(valueA, valueB, nodeA, nodeB);
                    },
                    filter: this.getColumnFilter(value.dataType),
                    valueSetter: (params) => {
                        return this.applyValueDataType(params);
                    },
                    headerComponentParams : {
                        template:
                            `<div class="ag-cell-label-container" role="presentation" ` + this.requiredStyle.style + `>
                              <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>
                              <div ref="eLabel" class="ag-header-cell-label" role="presentation">
                                <span ref="eSortOrder" class="ag-header-icon ag-sort-order" ></span>
                                <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon" ></span>
                                <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon" ></span>
                                <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon"></span>
                                <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>
                                ` + this.requiredStyle.asterisk + `
                                <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>
                              </div>
                            </div>`
                        }
                };

                // check for numeric columns
                if (value.dataType === 'Number') {
                    columnDef.type = 'numericColumn';
                }

                if (value.dataType === 'Date') {
                    columnDef.valueFormatter = function (params) {
                        if (!params.value) { return; }
                        // - this is important to prevent dates to shift based on browser tz
                        let date = params.value;
                        const userOffset = date.getTimezoneOffset() * 60000;
                        date =  new Date( date.getTime() + userOffset);
                        return moment(date).format('M/DD/YYYY');
                    };
                    columnDef.cellEditor = this.dateComponent.datePicker;
                    columnDef.filterParams = {};
                    columnDef.filterParams.browserDatePicker = true;
                }

                if (value.sourceOrigin) {
                    const customList = res.customLists.find(l => l._id === value.sourceOrigin);
                    columnDef.cellEditor = 'agSelectCellEditor';
                    if (!value.required) {
                        customList.listValue.unshift('');
                    }
                    columnDef.cellEditorParams = {
                        values: customList.listValue
                    };
                }
                columnDef.cellStyle = function(params) {

                    const fieldName = params.colDef.headerName;
                    const dataType =  params.context[fieldName].dataType;
                    let dataValid = true;
                    switch (dataType) {
                        case 'Date':
                            if (isNaN(Date.parse(params.value))) { dataValid = false; }
                            break;
                        case 'String':
                        if (!isString(params.value)) { dataValid = false; }
                            break;
                        case 'Number':
                            if (isNaN(params.value)) { dataValid = false; }
                            break;
                        case 'Boolean':
                            if (!isBoolean(params.value)) { dataValid = false; }
                            break;
                    }
                    if (!dataValid) { return  {color: 'red'}; } else { return null; }
                };
                columns.push(columnDef);
            }
        }

        return columns;
    }

    ignoreEmptyRecordsComparator(valueA, valueB, nodeA, nodeB) {
        // - checking is not an empty record
        if (!nodeA.data._id || !nodeB.data._id) {
            return;
        } else if (typeof valueA === 'string') {
            return valueA.localeCompare(valueB);
        } else {
            return (valueA > valueB ? 1 : (valueA < valueB ? -1 : 0));
        }
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

        // - no change or empty in a required field
        if (change.newValue === String(change.oldValue) ||
            (fieldDefinition.required && newValue === '')) {
            return false;
        }

        switch (fieldDefinition.dataType) {
            case 'String':
                newValue = String(newValue);
                break;
            case 'Number':
                newValue = Number(newValue);
                if (isNaN(newValue)) {
                    return false;
                }
                break;
            case 'Date':
                newValue = new Date(newValue);
                const newValTime = newValue.getTime();
                const oldValTime = (change.oldValue instanceof Date) ? change.oldValue.getTime() : null;
                if (isNaN(newValTime) || newValTime === oldValTime) {
                    return false;
                }
                break;
            case 'Boolean':
                let temp;
                newValue = newValue.toLowerCase();
                temp = newValue === 'true' || newValue === 'false';

                if (!temp) {
                    // - not required and is empty
                    if (newValue === '') {
                        newValue = null;
                    } else { return false; } // - other value Eg. newValue: "not boolean"
                } else {
                    newValue = (newValue === 'true'); // - is a valid boolean string
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

    isRowValid(changes) {
      const fields =  Object.keys(changes);
      let invalidFields;

      invalidFields = fields.filter( f => {
                        const field = this.getField(f);
                        if (f.toLocaleLowerCase() === 'source' || !field) { return false; }
                        // - the date field should be present in all rows to be valid
                        if (field.path === this.dateFieldPath && changes[f] === '') { return true; }
                        return this.getField(f).required && changes[f] === '';
                        });

      return !invalidFields.length;
    }

}

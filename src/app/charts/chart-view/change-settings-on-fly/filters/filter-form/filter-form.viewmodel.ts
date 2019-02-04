import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { SelectionItem } from '../../../../../ng-material-components';
import {
    IDatePickerConfig,
} from '../../../../../ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';
import {
    SelectPickerComponent,
} from '../../../../../ng-material-components/modules/forms/select-picker/select-picker.component';
import { IDataSource, IDataSourceField, IFilterOperator } from '../../../../../shared/domain/kpis/data-source';
import { IKPILogicOperator, KPILogicOperatorCollection } from '../../../../../shared/domain/kpis/operators';
import { CommonService } from '../../../../../shared/services/common.service';
import { Field } from '../../../../../ng-material-components/viewModels';
import { isEmpty, isString } from 'lodash';

// const QUERY_LIMIT = 10000;

export interface IFilterCriteria {
    name: string;
    source: string;
    field: string;
    limit: number;
    filter: string;
    collectionSource: string[];
}

@Injectable()
export class ChangeSettingsOnFlyFilterFormViewModel {
    editing = false;

    private _subscription: Subscription[] = [];

    private _filterFg: FormGroup;
    private _dataSource: IDataSource;
    private _fields: SelectionItem[];
    private _allOperators = KPILogicOperatorCollection;
    private _operators: SelectionItem[];
    private _operator: IKPILogicOperator;
    private _selectedField: IDataSourceField;
    private _criteriaItems: SelectionItem[] = [];
    private _criterias: string[];
    private _collectionSource: string;
    private _formTouched = false;

    // public dataSourceValuesTracker: any = {};

    public kpiSubject: Subject<string>;
    public criteriaPayloadSubject: Subject<IFilterCriteria>;
    public multiSelectionSeparator = '|';

    datePickerConfig: IDatePickerConfig;
    vmOperators: SelectPickerComponent;
    vmFields: SelectPickerComponent;
    vmCriteria: SelectPickerComponent;

    constructor() {
        this.kpiSubject = new Subject<string>();
        this.criteriaPayloadSubject = new Subject<IFilterCriteria>();
    }

    public initialize(fg: FormGroup) {
        const that = this;

        this._filterFg = fg;
        this._subscription.push(
            this._filterFg.get('field').valueChanges
                .distinctUntilChanged().subscribe(fieldId => {
                    that._onFieldChange(fieldId);
                    that._formTouched = true;
                })
        );

        this._subscription.push(
            this._filterFg.get('operator').valueChanges
                .distinctUntilChanged()
                .subscribe(operatorId => {
                    that._onOperatorChange(operatorId);
                    that._formTouched = true;
                })
        );

        this.datePickerConfig = {
            showGoToCurrent: false,
            format: 'MM/DD/YYYY'
        };
    }

    get dataSource(): IDataSource {
        return this._dataSource;
    }

    get collectionSource(): string {
        return this._collectionSource;
    }

    public unsubscribe(): void {
        CommonService.unsubscribe(this._subscription);
    }

    public updateDataSource(dataSource: IDataSource) {
        if (dataSource && dataSource !== this._dataSource) {
            this._dataSource = dataSource;

            if (this._filterFg) {
                this._onFieldChange(this._filterFg.get('field').value);
            }
        }
    }

    public updateCollectionSource(collectionSource: string): void {
        this._collectionSource = collectionSource;
    }

    public updateSelectableCriteria(criterias: string[]) {
        this._criteriaItems = criterias.map(c => new SelectionItem(c, c));

        const criteriaControl = this._filterFg.get('criteria');

        if (criteriaControl) {
            const value = criteriaControl.value;
            if (isString(value) && value) {

                // if the form was already touched we do nothing.
                if (this._formTouched) { return; }

                const hasMultiValues = value.indexOf('|');
                if (hasMultiValues !== -1) {
                    // case when the filter model is just loaded and the criterias doesnt contain the original definition
                    // edit kpi, may havee multi selection separated by |
                    const selectedValues = value.split('|');

                    const selectedItems = selectedValues.map(s => new SelectionItem(s, s));

                    const criteriaNotInList = selectedItems.filter(v => !this._criteriaItems.find(cI => cI.id === v.id ));

                    // we need to concat only the items that are not already there
                    this._criteriaItems = this._criteriaItems.concat(criteriaNotInList);
                } else {
                    const singleSelectionValueSelected = new SelectionItem(value, value);
                    const isSingleCriteriaNotInList = this._criteriaItems.find(cI => cI.id === singleSelectionValueSelected.id );

                    if (!isSingleCriteriaNotInList) {
                        this._criteriaItems = this._criteriaItems.concat(singleSelectionValueSelected);
                    }
                }
            }
        }
    }

    public updateFilterFields(fields: IDataSourceField[]): void {
        let filterAvailable = fields;
        const fieldValue = this._filterFg.get('field').value;

        filterAvailable = filterAvailable.filter(f => {
            if (f.available) {
                return f;
            }
            if (!f.available && fieldValue && (fieldValue === f.path)) {
                return f;
            }
        });
        this._fields = filterAvailable.map((field: IDataSourceField) => new SelectionItem(field.path, field.name.toLocaleUpperCase()));
    }

    resetFilter(): void {
        if (this.vmFields && this.vmFields.resetSelectedItems) {
            this.vmFields.resetSelectedItems();
        }

        if (this.vmOperators && this.vmOperators.resetSelectedItems) {
            this.vmOperators.resetSelectedItems();
        }

        if (this.vmCriteria && this._criteriaItems.length && this.vmCriteria.resetSelectedItems) {
            this.vmCriteria.resetSelectedItems();
        } else {
            this._resetCriteria();
        }
    }

    get fields(): SelectionItem[] {
        return this._fields;
    }

    get operators(): SelectionItem[] {
        return this._operators;
    }

    get selectableCriteria(): SelectionItem[] {
        return this._criteriaItems;
    }

    get isSingleSelector() {
        return this._operator && this.operatorValue && this._operator.control === 'single-selector';
    }

    get isMultiSelector() {
        return this._operator && this.operatorValue && this._operator.control === 'multi-selector';
    }

    get isTextBox() {
        return this._operator && this._operator.control === 'textbox';
    }

    get isDatePicker() {
        return this._operator && this._operator.control === 'datepicker';
    }

    get operatorValue() {
        const operatorControl = this._filterFg.get('operator');
        if (operatorControl) {
            return operatorControl.value;
        }
        return '';
    }

    isBooleanField(fieldName: string): boolean {
        const field = this._dataSource.fields.find(f => f.path === fieldName);

        return field ? field.type === 'Boolean' : false;
    }

    private get dataTypeOperators(): IFilterOperator[] {
        if (!this._dataSource || !this._dataSource.filterOperators || !this._selectedField) {
            return null;
        }
        return this._dataSource.filterOperators[this._selectedField.type] as IFilterOperator[];
    }

    _onFieldChange(fieldId: string) {
        const field = this._dataSource.fields.find(f => f.path === fieldId);
        this._selectedField = field;

        if (!field) {
            return this._operators = [];
        }

        // virtual source operators have preference over standard operators
        const vsDataTypeOperators = this.dataTypeOperators;

        if (vsDataTypeOperators) {
            this._operators = vsDataTypeOperators.map(o => new SelectionItem(o.name, o.description));
        } else {
            this._operators = this._allOperators.filter(o => o.type.indexOf(field.type) !== -1)
                .map(o => new SelectionItem(o.symbol, o.name));
        }


        const operator = this._filterFg.get('operator').value;
        if (operator) {
            this._onOperatorChange(operator, false);
        }

        if (this.vmCriteria) {
            if (this.vmCriteria['resetSelectedItems']) {
                this.vmCriteria.resetSelectedItems();
            } else {
                this._resetCriteria();
            }
        }

        this.updateCriteriaPayload();
    }

    private _onOperatorChange(operatorSymbol: string, resetCriteria?: boolean) {
        const vsDataTypeOperators = this.dataTypeOperators;
        let newOperator: IKPILogicOperator;

        if (vsDataTypeOperators) {
            const vsOperator = vsDataTypeOperators.find(o => o.name === operatorSymbol);

            // TODO: This is kind of hacking need to be changed
            newOperator = {
                id: -1,
                name: operatorSymbol,
                symbol: operatorSymbol,
                control: 'textbox'
            };
        } else {
            newOperator =
                this._allOperators.find(o => o.symbol === operatorSymbol && o.type.indexOf(this._selectedField.type) !== -1);
        }


        if (newOperator !== this._operator) {
            if (resetCriteria) {
                this._resetCriteria();
            }

            this._operator = newOperator;
        }
    }

    public updateCriteriaPayload() {
        const dSource = this._dataSource;
        const cSource = !isEmpty(this._collectionSource)
                        ? (Array.isArray(this._collectionSource)
                                ? this._collectionSource
                                : this._collectionSource.split('|'))
                        : null;

        if (!this._selectedField) { return; }

        this.criteriaPayloadSubject.next({
            name: dSource.name,
            source: dSource.name,
            field: this._selectedField.path,
            filter: '',
            limit: 25000,
            collectionSource: cSource
        });
    }

    private _resetCriteria() {

        // may not have formgroup at this time
        if (!this._filterFg) {
            return;
        }
        const criteria = this._filterFg.get('criteria');

        if (criteria) {
            criteria.setValue(null);
        }
    }

}

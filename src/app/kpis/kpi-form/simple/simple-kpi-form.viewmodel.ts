import { Injectable, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { FormArray } from '@angular/forms/src/model';
import { Apollo } from 'apollo-angular';
import { isEmpty, isString, uniq } from 'lodash';
import * as moment from 'moment';
import { Subject } from 'rxjs/Subject';

import { SelectionItem } from '../../../ng-material-components/models';
import { SelectPickerComponent } from '../../../ng-material-components/modules/forms/select-picker/select-picker.component';
import { ArrayField, ComplexField, Field, OnFieldChanges, ViewModel } from '../../../ng-material-components/viewModels';
import { IDataSource, IDataSourceField } from '../../../shared/domain/kpis/data-source';
import { IKPI } from '../../../shared/domain/kpis/kpi';
import { getArithmeticOperatorItems } from '../../../shared/domain/kpis/operators';
import { ITag, ITagItem } from '../../../shared/domain/shared/tag';
import { TagsViewModel } from '../../../shared/view-models/tags.viewmodel';
import { FilterViewModel } from '../shared/filter.viewmodel';
import { SimpleKpiExpressionViewModel } from '../shared/simple-kpi-expression.viewmodel';
import { IKPIPayload } from '../shared/simple-kpi-payload';
import { getAggregateFunctions } from '../../../shared/domain/kpis/functions';

export const KPINAMEREGULAREXPRESSION = /^([a-zA-Z0-9\*\-\(\)\$\&\:#%] *){5,}$/;
const expressionNumericFieldQuery = require('graphql-tag/loader!./get-expression-fields.query.gql');

@Injectable()
export class SimpleKpiFormViewModel extends ViewModel<IKPI> {
    private _dataSources: IDataSource[];
    private _tags: ITagItem[];
    private _selectedDataSource: IDataSource;
    private _expressionFieldValuesTracker: any = {};
    private existDuplicatedName: boolean;

    public expressionFieldSubject: Subject<string> = new Subject<string>();

    aggregateFunctions: SelectionItem[] = getAggregateFunctions();
    dataSources: SelectionItem[];
    numericFields: SelectionItem[];
    operators: SelectionItem[] = getArithmeticOperatorItems();
    numericFieldSelector: SelectPickerComponent;
    vmSource: SelectPickerComponent;

    disabledSource = false;
    sourceItems: SelectionItem[];
    consSourceValue: string;
    consSourceValues: string[] = [];

    constructor(private _apollo: Apollo, private _cdr: ChangeDetectorRef ) {
        super(null);
        this.expressionFieldSubject = new Subject<string>();
    }

    @Field({ type: String, validators: [
        Validators.pattern(
                KPINAMEREGULAREXPRESSION
            )
        ],
        required: true
    })
    name: string;

    @Field({ type: String })
    group: string;

    @Field({ type: String, required: true })
    description: string;

    @ComplexField({ type: SimpleKpiExpressionViewModel })
    expression: SimpleKpiExpressionViewModel;

    @ArrayField({ type: FilterViewModel })
    filter: FilterViewModel[];

    @Field({ type: String })
    groupings: string;

    @ArrayField({ type: TagsViewModel })
    tags: TagsViewModel[];

    @Field({ type: String })
    source: string;

    initialize(model: any): void {
        const that = this;
        if (model) {
            let dataSourceValue;
            let sourceCollectionValue;

            // deserialize expression and filters
            const cleanModel = this.objectWithoutProperties(model, ['__typename']) as IKPI;
            cleanModel.expression = JSON.parse(cleanModel.expression);

            dataSourceValue = (<any>cleanModel.expression).dataSource;

            if (cleanModel.filter) {
                cleanModel.filter = JSON.parse(cleanModel.filter);

                if (cleanModel.filter.length) {
                    const cleanModelFilter: string[] = [];
                    cleanModel.filter.forEach(item => {
                        // FIX for CORE-2630, transforming "La Jolla Cosmetic Surgery Centre, Inc 3092" => "01/01/3092"
                        // process source field first
                        if (item.field === 'source') {
                            cleanModel.source = item.criteria;
                            sourceCollectionValue = item.criteria;
                            return;
                        }

                        if (!cleanModel.expression) {
                            console.log('expression not ready');
                            return;
                        }

                        const virtualSource = that._dataSources.find(s => s.name === (<any>cleanModel.expression).dataSource);
                        const vsField = virtualSource.fields.find(f => f.path === item.field);

                        switch (vsField.type) {
                            case 'Date':
                                item.criteria = moment(item.criteria).format('MM/DD/YYYY');
                                break;

                            default:
                                item.criteria = String(item.criteria);
                                break;
                        }

                        cleanModelFilter.push(item);
                    });
                    cleanModel.filter = cleanModelFilter;
                }
            }

            if (cleanModel.tags) {
                cleanModel.tags = cleanModel.tags.map(t => ({ value: t, display: t })) as any;
            }
            this._queryFields(dataSourceValue, sourceCollectionValue || []);
            this.onInit(cleanModel);
            this._cdr.detectChanges();
        } else {
            this.onInit(model);
            this._cdr.detectChanges();
        }

        this.expressionFieldSubject.subscribe(expressionField => {
            if (!that._expressionFieldValuesTracker.currentValue && !that._expressionFieldValuesTracker.previousValue) {
                that._expressionFieldValuesTracker = {
                    currentValue: expressionField,
                    previousValue: undefined
                };
            } else {
                if (that._expressionFieldValuesTracker.currentValue !== expressionField) {
                    const currentValue = that._expressionFieldValuesTracker.currentValue;
                    that._expressionFieldValuesTracker.previousValue = currentValue;
                    that._expressionFieldValuesTracker.currentValue = expressionField;
                }
            }
        });
    }

    _getFilterValues() {
        if (!this.source) { return this.filter; }

        const arraysFilter: any[] = [];
        const arrayFilterSource: any[] = [];
        arrayFilterSource.push({
            'criteria': this.source,
            'field': 'source',
            'operator': this._operatorSelected(this.source)
        });

        if (this.filter.length === 0) { return arrayFilterSource; }

        const kpiFilters = this.filter.map(f => ({
            field: f.field,
            operator: f.operator,
            criteria: f.criteria
        }));

        return [].concat(arrayFilterSource, kpiFilters);
    }

    _operatorSelected(valueSource) {
        const arraySource = valueSource.split('|').map(t => t);
        let oper;
            if (arraySource.length > 1) {
                oper = 'in';
            } else {
                oper = 'eq';
            }
        return oper;
    }

    get payload(): IKPIPayload {
        const value = this.fg.value;
        const payload: IKPI = {
            name: (value.name) ? value.name.trim() : null,
            group: value.group,
            description: value.description,
            type: 'simple',
            expression: JSON.stringify(value.expression as any),
            filter: JSON.stringify(this._getFilterValues()),
            tags: value.tags ? value.tags.map(t => t.value) : null,
            source: value.source
        };
        const result: IKPIPayload = { input: payload };

        if (this._id) {
            result.id = this._id;
        }

        return result;
    }

    get selectedDataSource(): IDataSource {
        // return this._selectedDataSource;
        return this._dataSources.find(d => d.name === this.expression.dataSource);
    }

    get shouldCollapseFilters(): boolean {
       return !this.fg.touched && (this.fg.get('filter') as FormArray).controls.length === 0;
       // return this.filter.length === 0;
    }

    get shouldCollapseArithmeticOperation(): boolean {
        return this.fg.value.expression.value === null;
    }

    get existingTags(): ITagItem[] {
        return this._tags;
    }

    get sourceValue() {
        return this.fg.controls['source'].setValue(this.consSourceValue);
    }

    resetItemSource() {
        if (this.sourceItems) {
            this.vmSource.resetSelectedItems();
            this.sourceItems = this.consSourceValues.map(s => new SelectionItem(s, s));
        }
    }

    updateDataSources(dataSources: IDataSource[]) {
        if (!dataSources || this._dataSources === dataSources) {
            return;
        }

        const cleanDataSources = this._getCleanDataSources(dataSources);

        this._dataSources = cleanDataSources;
        this.dataSources = dataSources.filter(s => !s.externalSource).map(s => new SelectionItem(s.name, s.description.toUpperCase()));

        this.updateItemSources(dataSources);

        // once the data source list its update I need to make sure I update the fields
        if (this.hasFormControls(this.fg)) {
            this._updateExpressionNumericFields({
                'expression.dataSource': this.fg.get('expression').get('dataSource').value,
                'source': this.fg.get('source').value,
                'expression.function': this.fg.get('expression').get('function').value,
            });
        }

        this._cdr.markForCheck();
    }

    hasFormControls(fg: FormGroup): boolean {
        return (fg && !isEmpty(fg.controls)) ? true : false;
    }

    updateItemSources(dataSources: IDataSource[]): void {
        // get all the sources without duplicates
        let sources: string[] = [];
        dataSources.map((d: IDataSource) => {
            sources = sources.concat(d.sources);
        });

        sources = uniq(sources);
        this.sourceItems = sources.map(s => new SelectionItem(s, s));

        let nonExistItems: string[] = [];

        if (isString(this.source)) {
            const arraySourceValues: string[] = this.source.split(/\|/);
            const sourceItemIds = this.sourceItems.map(s => s.id);
            nonExistItems = arraySourceValues.filter(v => sourceItemIds.indexOf(v) === -1);
        }

        if (Array.isArray(nonExistItems) && nonExistItems.length && this.source) {
            const addMissingSelectedItems = nonExistItems.map(n => new SelectionItem(n, n));
            this.sourceItems = this.sourceItems.concat(addMissingSelectedItems);
        }

        if (this.source) {
            this.getDataSourceList(this.source);
        }

        this._cdr.markForCheck();
    }

    updateExpressionFields(fieldList: IDataSourceField[]): void {
        if (!fieldList) {
            this.numericFields = [];
            return;
        }

        // filter out fields that does not exist in collection
        // return field that does not exist in collection, but does for edit kpi
        const exp = this.expression;
        const isCountExp = exp && exp.function && exp.function.toLowerCase() === 'count';
        const availableFields = fieldList.filter(f => {
            return f.available ?
                // if is a count exp return all fields other wise return only numeric ones
                (isCountExp ? true : f.type === 'Number')
                :
                // return true if the expression is already using this field
                (exp.field === f.path);
        });

        this.numericFields = availableFields.map(f => new SelectionItem(f.path, f.name.toUpperCase()));
    }

    getDataSourceList(item: any): void {
        const reg: RegExp = /\|/;
        if (!item) {
            this.dataSources = this._dataSources.filter(s => !s.externalSource)
                                                .map(s => new SelectionItem(s.name, s.description.toUpperCase()));
            return;
        }

        this.dataSources = this._dataSources
                                .filter((dSource: IDataSource) => {
                                    // multiple selection
                                    if (reg.test(item)) {
                                        const itemArray = item.split(reg);
                                        return dSource.sources.find(d => itemArray.indexOf(d) !== -1);
                                    }
                                    // single selection
                                    return dSource.sources.indexOf(item) !== -1;
                                })
                                .map(s => new SelectionItem(s.name, s.description.toUpperCase()));
        if (!this.dataSources.length && !reg.test(item)) {
            const dataSourceValue: string = (this.expression && this.expression.dataSource) ? this.expression.dataSource : '';
            if (dataSourceValue) {
                const selectedDataSource: IDataSource = this._dataSources.find(d => d.name === dataSourceValue);

                if (selectedDataSource) {
                    this.dataSources.push(new SelectionItem(selectedDataSource.name, selectedDataSource.description.toUpperCase()));
                }
            }
        }
    }

    updateTags(tags: ITag[]) {
        this._tags = tags.map(t => ({ value: t.name, display: t.name }));
        this._cdr.markForCheck();
    }

    updateExistDuplicatedName(exist: boolean) {
        this.existDuplicatedName = exist;
    }

    getExistDuplicatedName() {
        return this.existDuplicatedName;
    }

    private _queryFields(dataSource: string, collectionSource?: string[]): void {
        const that = this;
        this._apollo.query<{ kpiExpressionFields: IDataSourceField[]}>({
            query: expressionNumericFieldQuery,
            fetchPolicy: 'network-only',
            variables: {
                input: {
                    collectionSource: collectionSource,
                    dataSource: dataSource
                }
            }
        }).subscribe(({ data }) => {
            that.updateExpressionFields(data.kpiExpressionFields);
            this._cdr.markForCheck();
        });
    }

    private _getCleanDataSources(dataSources: IDataSource[]): IDataSource[] {
        return dataSources.map((dSource: IDataSource) => {
            const temp = {};
            Object.keys(dSource).forEach(key => {
                // return fields object array without __typename
                if (key === 'fields') {
                    temp[key] = dSource[key].map(s => this.objectWithoutProperties(s, ['__typename']));
                } else {
                    temp[key] = dSource[key];
                }
            });
            return temp;
        }) as IDataSource[];
    }

    // @OnFieldChanges([{ name: 'expression.dataSource' }, { name: 'source' }])
    // private _updateExpressionNumericFields(value: { 'expression.dataSource': string, 'source': string}) {
    //     // this.expressionFieldSubject.next(value['expression.dataSource']);
        // const dSource = this._dataSources.find(d => d.name === value['expression.dataSource']);

        // reset selected items for expression.field
        // const { currentValue, previousValue } = this._expressionFieldValuesTracker;
        // if ((previousValue !== undefined) && (previousValue !== currentValue)) {
        //     this.numericFieldSelector.resetSelectedItems();
        // }

        // if (dSource) {
        //     this._selectedDataSource = dSource;
        // }

        // const dataSource: string = value['expression.dataSource'] || (this.expression ? this.expression.dataSource : '');
        // const source: string = value['source'] || this.source;


        // if (dataSource) {
        //     const that = this;

        //     const collectionSource = source ? source.split(/\|/) : [];

        //     this._apollo.watchQuery<{ kpiExpressionFields: IDataSourceField[]}>({
        //         query: expressionNumericFieldQuery,
        //         fetchPolicy: 'network-only',
        //         variables: {
        //             input: {
        //                 collectionSource: collectionSource,
        //                 dataSource: dataSource
        //             }
        //         }
        //     }).valueChanges.subscribe(({ data }) => {
        //         that.updateExpressionNumericFields(data.kpiExpressionFields);
        //     });
        // }

    //     const ds = this.expression.dataSource;
    //     if (ds) {
    //         this._selectedDataSource = this._dataSources.find(d => d.name === ds);
    //         const sourceFilter = this.source && this.source.split(/\|/) || [];
    //         this._apollo.query<{ kpiExpressionFields: IDataSourceField[]}>({
    //                     query: expressionNumericFieldQuery,
    //                     fetchPolicy: 'network-only',
    //                     variables: {
    //                         input: {
    //                             collectionSource: sourceFilter,
    //                             dataSource: ds
    //                         }
    //                     }
    //                 }).subscribe(({ data }) => {
    //                     this.updateExpressionNumericFields(data.kpiExpressionFields);
    //                 });
    //     } else {
    //         this._selectedDataSource = null;
    //         this.numericFields = [];
    //         this.filter.length = 0;
    //     }
    // }

    @OnFieldChanges([{ name: 'expression.dataSource' }, { name: 'source' }, { name: 'expression.function' }])
    private _updateExpressionNumericFields(value: { 'expression.dataSource': string, 'source': string,
                                                    'expression.function': string }) {
        const { 'expression.dataSource': dataSourceValue = null, source: sourceValue = null } = value;

        let dataSource: IDataSource;
        let collectionSourceVar = [];
        let dataSourceVar: string;

        if (dataSourceValue) {
            this.expressionFieldSubject.next(value['expression.dataSource']);
            dataSource = this._dataSources.find(d => d.name === value['expression.dataSource']);

            if (!dataSource) { return; }

            this._selectedDataSource = dataSource;

            // reset selected items for expression.field
            const { currentValue, previousValue } = this._expressionFieldValuesTracker;
            if ((previousValue !== undefined) && (previousValue !== currentValue)) {
                this.numericFieldSelector.resetSelectedItems();

                // filter = [] doesn't do the job
                while (this.filter.length !== 0) {
                    this.filter.pop();
                }
            }

            // this.numericFields =
            //     dataSource.fields   .filter(f => f.type === 'Number')
            //                         .map(f => new SelectionItem(f.path, f.name.toUpperCase()));
            if (value['expression.function'] && value['expression.function'].toLowerCase() === 'count' ) {
                this.numericFields = this._selectedDataSource.fields.map(f =>
                    new SelectionItem(f.path, f.name.toUpperCase()));
            } else {
                this.numericFields = this._selectedDataSource.fields.filter(f => f.type === 'Number')
                    .map(f => new SelectionItem(f.path, f.name.toUpperCase()));
            }
        }

        const source: string = sourceValue || this.source;

        collectionSourceVar = source ? source.split(/\|/) : [];
        dataSourceVar = dataSourceValue || this.expression.dataSource;

        // const dataSource: string = value['expression.dataSource'] || (this.expression ? this.expression.dataSource : '');
        this._queryFields(dataSourceVar, collectionSourceVar);
    }

    @OnFieldChanges({ name: 'expression.function' })
    private _updateExpressionFieldsForCountFunction(value: { 'expression.function': string}) {
        if (!this._selectedDataSource) { return; }

        if (value['expression.function'] && value['expression.function'].toLowerCase() === 'count' ) {
            this.numericFields = this._selectedDataSource.fields.map(f =>
                new SelectionItem(f.path, f.name.toUpperCase()));
        } else {
            this.numericFields = this._selectedDataSource.fields.filter(f => f.type === 'Number')
                .map(f => new SelectionItem(f.path, f.name.toUpperCase()));
        }

        this._cdr.markForCheck();
    }

    @OnFieldChanges({ name: 'expression.operator' })
    private _updateExpressionValue(value: { 'expression.operator': string }): void {
        const operator: string = value['expression.operator'];

        if (isEmpty(operator)) {
            this.expression.value = null;
        }

        this._cdr.markForCheck();
    }
}

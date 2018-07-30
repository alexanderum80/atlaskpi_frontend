import { FormArray } from '@angular/forms/src/model';
import { SelectPickerComponent } from '../../../ng-material-components/modules/forms/select-picker/select-picker.component';
import { Subject } from 'rxjs/Subject';
import { isEmpty } from 'lodash';
import { Injectable } from '@angular/core';

import { SelectionItem } from '../../../ng-material-components/models';
import { ArrayField, ComplexField, Field, OnFieldChanges, ViewModel } from '../../../ng-material-components/viewModels';
import { IExternalDataSource } from '../../../shared/domain/kpis/data-source';
import { getAggregateFunctions } from '../../../shared/domain/kpis/functions';
import { IKPI } from '../../../shared/domain/kpis/kpi';
import { getArithmeticOperatorItems } from '../../../shared/domain/kpis/operators';
import { FilterViewModel } from '../shared/filter.viewmodel';
import { SimpleKpiExpressionViewModel } from '../shared/simple-kpi-expression.viewmodel';
import { UserService } from '../../../shared/services/index';
import { IKPIPayload } from '../shared/simple-kpi-payload';

@Injectable()
export class ExternalSourceKpiFormViewModel extends ViewModel<IKPI> {
    private _dataSources: IExternalDataSource[];
    private _selectedDataSource: IExternalDataSource;
    private _expressionFieldValuesTracker: any = {};
    private existDuplicatedName: boolean;

    public expressionFieldSubject: Subject<string> = new Subject<string>();

    dataSources: SelectionItem[];
    numericFields: SelectionItem[];
    aggregateFunctions: SelectionItem[] = getAggregateFunctions();
    operators: SelectionItem[] = getArithmeticOperatorItems();

    numericFieldSelector: SelectPickerComponent;

    constructor(userService: UserService) {
        super(userService);
    }

    @Field({ type: String, required: true })
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

    initialize(model: any): void {
        if (model) {
            // deserialize expression and filters
            const cleanModel = this.objectWithoutProperties(model, ['__typename']) as IKPI;
            cleanModel.expression = JSON.parse(cleanModel.expression);

            if (cleanModel.filter) {
                cleanModel.filter = JSON.parse(cleanModel.filter);
            }

            this.onInit(cleanModel);
        } else {
            this.onInit(model);
        }

        const that = this;
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

    get payload(): IKPIPayload {
        const value = this.fg.value;

        const payload: IKPI = {
            name: (value.name) ? value.name.trim() : null,
            group: value.group,
            description: value.description,
            type: 'externalsource',
            expression: JSON.stringify(value.expression as any),
            filter: JSON.stringify((value as any).filter),
            tags: value.tags,
            source: value.source
        };

        const result = { input: payload } as IKPIPayload;

        if (this._id) {
            result.id = this._id;
        }

        return result;
    }

    get selectedDataSource(): IExternalDataSource {
        return this._selectedDataSource;
    }

    get shouldCollapseFilters(): boolean {
        return (this.fg.get('filter') as FormArray).controls.length === 0;
    }

    get shouldCollapseArithmeticOperation(): boolean {
        return this.fg.value.expression.value === null;
    }

    updateDataSources(dataSources: IExternalDataSource[]) {
        if (!dataSources || this._dataSources === dataSources) {
            return;
        }

        this._dataSources = dataSources;
        this.dataSources = dataSources.map(s => new SelectionItem(s.id, s.description.toUpperCase()));

        // once the data source list its update I need to make sure I update the fields
        this._updateExpressionFields({
            'expression.dataSource': this.fg.get('expression').get('dataSource').value
        });
    }

    @OnFieldChanges({ name: 'expression.dataSource' })
    private _updateExpressionFields(value: { 'expression.dataSource': string }) {
        const dataSource = this._dataSources.find(d => d.id === value['expression.dataSource']);
        if (!dataSource) {
            return;
        }
        this._selectedDataSource = dataSource;

        const { currentValue, previousValue } = this._expressionFieldValuesTracker;
        if ((previousValue !== undefined) && (previousValue !== currentValue)) {
            this.numericFieldSelector.resetSelectedItems();
        }

        this.numericFields = dataSource.fields.filter(f => f.type === 'Number')
            .map(f => new SelectionItem(f.path, f.name.toUpperCase()));
    }

    updateExistDuplicatedName(exist: boolean) {
        this.existDuplicatedName = exist;
    }

    getExistDuplicatedName() {
        return this.existDuplicatedName;
    }

}

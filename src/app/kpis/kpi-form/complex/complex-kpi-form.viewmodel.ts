import { Injectable } from '@angular/core';

import { Field, ViewModel } from '../../../ng-material-components/viewModels';
import { IDataSource } from '../../../shared/domain/kpis/data-source';
import { IKPI } from '../../../shared/domain/kpis/kpi';
import { UserService } from '../../../shared/services/user.service';
import { IKPIPayload } from '../shared/simple-kpi-payload';
import { IWidgetFormGroupValues } from '../../../widgets/shared/models';
import { IChartFormValues } from '../../../charts/shared/models/chart.models';


const REGULAR_EXPRESSION_FOR_SAVING = /@{([\w\d\s\(\)%$!&#-=]+><)}/g;

@Injectable()
export class ComplexKpiFormViewModel extends ViewModel<IKPI> {

    private _kpis: IKPI[];
    private _dataSources: IDataSource[];
    private _originalExpression: string;
    private existDuplicatedName: boolean;

    valuesPreviewWidget: IWidgetFormGroupValues = {
        name: '',
        description: '',
        type: 'numeric',
        size: 'big',
        order: '4',
        color: '',
        kpi: '',
        predefinedDateRange: 'this year',
        format: 'dollar',
        comparison: 'previousPeriod',
        comparisonArrowDirection: 'up'
      };
      valuesPreviewChart: IChartFormValues = {
        name: '',
        description: '',
        dashboards: '',
        group: 'pre-defined',
        frequency: 'monthly',
        grouping: '',
        tooltipEnabled: true,
        predefinedTooltipFormat: 'multiple_percent',
        kpi: '',
        legendEnabled: false,
        predefinedDateRange: 'this year',
        invertAxisEnabled: false,
        seriesDataLabels: false
      };
    constructor(userService: UserService) {
        super(userService);
    }

    @Field({ type: String, required: true })
    name: string;

    @Field({ type: String, required: true })
    description: string;

    @Field({ type: String, required: true })
    expression: string;

    initialize(model: any): void {
        if (model) {
            // make sure I clean the complex expression first
            this._originalExpression = model.expression;
            model = this.objectWithoutProperties(model, ['__typename']);
            model.expression = '';
        }

        this.onInit(model);
    }

    get payload(): IKPIPayload {
        const value = this.fg.value;

        const payload: IKPI = {
            name: (value.name) ? value.name.trim() : null,
            group: value.group,
            description: value.description,
            type: 'complex',
            expression: this._getExpressionForSaving(value.expression),
            tags: value.tags,
            source: value.source
        };

        const result: IKPIPayload = { input: payload };

        if (this._id) {
            result.id = this._id;
        }

        return result;
    }

    get dataSources(): IDataSource[] {
        return this._dataSources;
    }

    get kpis(): IKPI[] {
        return this._kpis;
    }

    updateKpis(kpis: IKPI[]) {
        if (kpis !== this._kpis) {
            let allKpis = kpis;
            if (this._id && Array.isArray(allKpis) && allKpis.length) {
                allKpis = allKpis.filter(kpi => kpi._id !== this._id);
            }

            this._kpis = allKpis;
        }

        this.expression = this._getExpressionForShowing(this._originalExpression);
    }

    updateDataSources(dataSources: IDataSource[]) {
        if (dataSources !== this._dataSources) {
            this._dataSources = dataSources;
        }
    }

    validExpression(): boolean {
        const expression: string = this.fg.value.expression;

        const numericReg = /^\d+$/;
        const isNumericOnly = numericReg.test(expression);

        if (isNumericOnly) {
            return true;
        }

        const reg = new RegExp('@{([\\w\\d\\s\\(\\)%$!&#-=><]+)}', 'g');
        return reg.test(expression);
    }

    private _getExpressionForSaving(expression: string): string {
        let result = expression;
        let match: RegExpExecArray;

        // const regExp = /@{([\w\d\s\(\)%$!&#-=]+)}/g;
        const reg = new RegExp('@{([\\w\\d\\s\\(\\)%$!&#-=><]+)}', 'g');

        while (match = reg.exec(expression)) {
            if (match) {
                const kpi = this._kpis.find(k => k.name === match[1]);
                result = result.replace(match[0], `kpi${kpi._id}`);
            }
        }

        return result;
    }

    private _getExpressionForShowing(expression: string): string {
        if (!this._kpis || this._kpis.length < 1) {
            return expression;
        }

        let result = expression;
        const regex = new RegExp(/kpi(\w+)/g);
        let match: any;

        while (match = regex.exec(expression)) {
            const kpi = this._kpis.find(k => k._id === match[1]);
            result = result.replace(match[0], `@{${kpi.name}}`);
        }

        return result;
    }

    updateExistDuplicatedName(exist: boolean) {
        this.existDuplicatedName = exist;
    }

    getExistDuplicatedName() {
        return this.existDuplicatedName;
    }

    selectColorWidget() {
        switch (Math.round(Math.random() * 10)) {
            case 0:
                return 'white';
            case 1:
                return 'orange';
            case 2:
                return 'blue';
            case 3:
                return 'green';
            case 4:
                return 'light-green';
            case 5:
                return 'sei-green';
            case 6:
                return 'purple';
            case 7:
                return 'light-purple';
            case 8:
                return 'pink';
            default:
                return 'white';
        }
    }

}

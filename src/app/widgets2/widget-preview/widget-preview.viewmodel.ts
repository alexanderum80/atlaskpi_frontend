import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { isEmpty, pick } from 'lodash';

import { Field, ViewModel } from '../../ng-material-components/viewModels';
import { IChartDateRange } from '../../shared/models/date-range';
import { INumericWidgetData, IWidgetViewData } from './../shared/models/widget';

export interface IWidgetData {
    name: string;
    description: string;
    type: string;
    size: string;
    color: string;
    kpi: string;
    dateRange: IChartDateRange;
    comparison: string;
    comparisonArrowDirection: string;
    format: string;
    chart: string;
}

@Injectable()
export class WidgetPreviewViewModel extends ViewModel<IWidgetData> {

    constructor() {
        super(null);
    }

    @Field({ type: String, validators: [ Validators.minLength(3) ], required: true })
    name: string;
    @Field({ type: String })
    description: string;
    @Field({ type: String, required: true })
    type: string;
    @Field({ type: String, required: true })
    size: string;
    @Field({ type: String })
    color: string;
    @Field({ type: String })
    kpi: string;
    @Field({ type: String })
    dateRange: IChartDateRange;
    @Field({ type: String })
    comparison: string;
    @Field({ type: String })
    comparisonArrowDirection: string;
    @Field({ type: String })
    format: string;
    @Field({ type: String })
    chart: string;

    // materialized?:  IWidgetMaterializedFields;
    public chartWidgetData: string;
    public numericWidgetData: INumericWidgetData;

    initialize(model: IWidgetData): void {
        this.onInit(model);
    }

    get isAValidNumericWidget(): boolean {
        return this.valid && !isEmpty(this.kpi) &&
               this.isDateRangeValid && this.type === 'numeric';
    }

    get isAValidChartWidget(): boolean {
        return this.valid && !isEmpty(this.chart) && this.type === 'chart';
    }

    get isDateRangeValid(): boolean {
        if (!this.dateRange || this.dateRange && isEmpty(this.dateRange.predefined)) { return false; }

        if (this.dateRange.predefined === 'custom') {
            const start = new Date(this.dateRange.custom.from);
            const end = new Date(this.dateRange.custom.to);

            return start && end && end > start;
        }
        return true;
    }

    get isWidgetSmall(): boolean {
        return this.size === 'small';
    }

    get widgetViewData(): IWidgetViewData {
        const data = <IWidgetViewData>pick(this, [
            'name',
            'description',
            'size',
            'type',
            'color',
            'format',
        ]);

        if (this.type === 'chart') {
            data['chartWidgetData'] = this.chartWidgetData;
        }

        if (this.type === 'numeric') {
            data['numericWidgetData'] = this.numericWidgetData;
        }

        return data;
    }
}

import { Injectable } from '@angular/core';
import { isEmpty } from 'lodash';

import { SelectionItem } from '../../ng-material-components';
import { ComplexField, Field, OnFieldChanges, ViewModel } from '../../ng-material-components/viewModels';
import { ValueFormatHelper } from '../../shared/helpers/format.helper';
import { IDateRangeItem } from '../../shared/models';
import { IWidget } from '../shared/models/widget';
import { IWidgetData } from './../widget-preview/widget-preview.viewmodel';


const widgetTypeList: SelectionItem[] = [{
        id: 'numeric',
        title: 'Numeric'
    },
    {
        id: 'chart',
        title: 'Chart'
    }
];

const widgetOrderList: SelectionItem[] = [{
        id: '1',
        title: '1'
    },
    {
        id: '2',
        title: '2'
    },
    {
        id: '3',
        title: '3'
    },
    {
        id: '4',
        title: '4'
    },
];

const widgetColorList: SelectionItem[] = [{
        id: 'white',
        title: 'white'
    },
    {
        id: 'orange',
        title: 'orange'
    },
    {
        id: 'blue',
        title: 'blue'
    },
    {
        id: 'green',
        title: 'green'
    },
    {
        id: 'light-green',
        title: 'light-green'
    },
    {
        id: 'sei-green',
        title: 'sei-green'
    },
    {
        id: 'purple',
        title: 'purple'
    },
    {
        id: 'light-purple',
        title: 'light-purple'
    },
    {
        id: 'pink',
        title: 'pink'
    },
];

const widgetArrowDirection: SelectionItem[] = [{
        id: 'none',
        title: 'None'
    },
    {
        id: 'up',
        title: 'Arrow Up'
    },
    {
        id: 'down',
        title: 'Arrow Down'
    },
];

const widgetSizeList: SelectionItem[] = [{
        id: 'small',
        title: 'Small'
    },
    {
        id: 'big',
        title: 'Big'
    }
];

export class DateRangeViewModel {

    @Field({ type: Date })
    from: Date;

    @Field({ type: Date })
    to: Date;
}

export class ChartDateRangeViewModel {

    @Field({ type: String })
    predefined?: string;

    @ComplexField({ type: DateRangeViewModel })
    custom?: DateRangeViewModel;
}

@Injectable()
export class WidgetFormViewModel extends ViewModel < IWidget > {

    constructor() {
        super(null);
    }

    // Fields Section

    @Field({
        type: String,
        required: true
    })
    name: string;

    @Field({
        type: String,
        required: true
    })
    description: string;

    @Field({
        type: String,
        required: true
    })
    size: string;

    @Field({
        type: String,
        required: true
    })
    type: string;

    @Field({
        type: Number,
        required: true
    })
    order: string;

    @Field({
        type: String,
        required: true
    })
    color: string;

    @Field({
        type: String,
        required: true
    })
    kpi: string;

    @ComplexField({ type: ChartDateRangeViewModel })
    dateRange: ChartDateRangeViewModel;

    @Field({
        type: String,
        required: true
    })
    comparison: string;

    @Field({
        type: String,
        required: true
    })
    format: string;

    @Field({
        type: String,
        required: true
    })
    comparisonArrowDirection: string;

    @Field({
        type: String,
        required: true
    })
    chart: string;

    // LIsts Section

    sizeSelectionList = widgetSizeList;
    typeSelectionList = widgetTypeList;
    orderSelectionList = widgetOrderList;
    colorSelectionList = widgetColorList;
    comparisonSelectionList: SelectionItem[] = [];
    dateRangeSelectionList: SelectionItem[] = [
        { id: 'lastMonth', title: 'Last Month'},
        { id: 'lastYear', title: 'Last Year'}
    ];
    widgetArrowDirectionList = widgetArrowDirection;
    valueFormatList: SelectionItem[] = ValueFormatHelper.GetFormatSelectionList();
    chartSelectionList: SelectionItem[] = [];
    kpiSelectionList: SelectionItem[] = [];

    // standard properties
    private _dateRanges: IDateRangeItem[];

    private _widgetData = {
            'name': null,
            'description': null,
            'type': null,
            'size': null,
            'color': null,
            'kpi': null,
            'dateRange': null,
            'comparison': null,
            'comparisonArrowDirection': null,
            'format': null,
            'chart': null
    };

    get widgetData(): IWidgetData {
        return this._widgetData;
    }

    public initialize(model: IWidget): void {
        this.onInit(model);

        if (!model) {
            this._setDefaultValues();
        }
    }

    public setCharts(chartList: any[]) {
        this.chartSelectionList = chartList.map(c => new SelectionItem(c._id, c.title));
    }

    public setDateRanges(dateRanges: any[]) {
        this._dateRanges = dateRanges;
        this.dateRangeSelectionList = dateRanges.map(d => new SelectionItem(d.dateRange.predefined, d.dateRange.predefined));
    }

    public setKpis(kpis: any[]) {
        this.kpiSelectionList = kpis.map(k => new SelectionItem(k._id, k.name));
    }

    @OnFieldChanges([
        { name: 'dateRange.predefined' }
    ])
    private _onDateRangeChanges(changes) {
        const found = this._dateRanges.find(d => d.dateRange.predefined === changes['dateRange.predefined']);
        if (found) {
            this.comparisonSelectionList = found.comparisonItems.map(i => new SelectionItem(i.key, i.value));
        }
    }

    @OnFieldChanges([
        { name: 'name' },
        { name: 'description' },
        { name: 'type' },
        { name: 'size' },
        { name: 'color' },
        { name: 'kpi' },
        { name: 'dateRange' },
        { name: 'comparison' },
        { name: 'comparisonArrowDirection' },
        { name: 'format' },
        { name: 'chart' }
    ])
    private _onWidgetDataFieldsChanges(changes) {
        const oldWidgetData = this._widgetData;
        this._widgetData = {} as any;

        Object.assign( this._widgetData, oldWidgetData, changes);
    }

    private _setDefaultValues() {
        // default values
        Object.assign(this, {
            size: 'small',
            type: 'chart',
            color: 'white'
        });
    }

    get isNumericWidget(): boolean {
        return this.type === 'numeric';
    }

    get isComparison(): boolean {
        return !isEmpty(this.comparison);
    }

}

import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

import { SelectionItem } from '../ng-material-components/models';
import { ArrayField, ComplexField, Field, ViewModel } from '../ng-material-components/viewModels';
import { OnFieldChanges } from '../ng-material-components/viewModels/on-field-changes.decorator';
import { ValueFormatHelper } from '../shared/helpers/format.helper';
import { UserService } from '../shared/services/index';

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

const comparisonDirectionArrowList: SelectionItem[] = [{
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

const widgetSizeList: SelectionItem[] = [
    {
        id: 'small',
        title: 'Small'
    },
    {
        id: 'big',
        title: 'Big'
    }
];

export interface IMyWidget {
    name: string;
    size: string;
    dateRange: {
        predefined: string,
        customRange: {
            from: Date,
            to: Date
        }
    };
    kpiFilters: [{
        field: string,
        value: string
    }];
}

export class CustomDateRangeType {
    @Field({
        type: Date
    })
    from: Date;

    @Field({
        type: Date
    })
    to: Date;
}

export class DateRangeType {
    @Field({
        type: String
    })
    predefined: string;

    @ComplexField({
        type: CustomDateRangeType
    })
    customRange: CustomDateRangeType;
}

export class KpiFilterType {
    @Field({
        type: String
    })
    field: string;

    @Field({
        type: String
    })
    value: string;

    // @ComplexField({ type: DateRangeType })
    // dateRange: DateRangeType;
}

@Injectable()
export class NewWidgetViewModel extends ViewModel < IMyWidget > {

    constructor(userService: UserService) {
        super(userService);
    }

    @Field({
        type: String,
        required: true,
        validators: [Validators.minLength(3)]
    })
    name: string;

    @ComplexField({
        type: DateRangeType
    })
    dateRange: DateRangeType;

    @ArrayField({
        type: KpiFilterType
    })
    kpiFilters: KpiFilterType[];

    @Field({
        type: Number
    })
    distance: number;

    @Field({
        type: String
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
        type: String,
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
    positiveOutcome: string;

    // LISTS

    widgetSizes = widgetSizeList;
    widgetTypes = widgetTypeList;
    widgetOrders = widgetOrderList;
    widgetColors = widgetColorList;
    comparisonDirections = comparisonDirectionArrowList;
    valueFormats: SelectionItem[] = ValueFormatHelper.GetFormatSelectionList();

    // Initialization

    initialize(model: IMyWidget) {
        this.onInit(model);

        if (!model) {
            this._setDefaultValues();
        }
    }

    // State properties

    get numericMode(): boolean {
        return this.type === 'numeric';
    }

    get showingBigWidget(): boolean {
        return this.size === 'big';
    }

    get usingCustomDateRange(): boolean {
        return this.dateRange.predefined === 'custom';
    }

    // Subscription to field changes

    @OnFieldChanges([{ name: 'type' }])
    public _processTypeChanges(newType) {
        // console.log('Numeric mode: ' + this.numericMode);

        if (this.numericMode) {
           this.widgetSizes = widgetSizeList;
        } else {
            this.widgetSizes = [{
                id: 'teal',
                title: 'Teal'
            }];
        }
    }

    // private methods

    private _setDefaultValues() {
        // this.type = 'numeric';
    }

}

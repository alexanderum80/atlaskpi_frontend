import { ApolloService } from './../../shared/services/apollo.service';
import { Apollo } from 'apollo-angular';
import {
    IChartDateRange
} from '../../shared/models/date-range';
import {
    Component,
    OnInit,
    Input,
    SimpleChanges
} from '@angular/core';
import {
    IWidgetData,
    WidgetPreviewViewModel,
} from './widget-preview.viewmodel';
import {
    OnChanges
} from '@angular/core';
import { clone } from 'lodash';

declare var require;
const previewWidgetQuery = require('graphql-tag/loader!./preview-widget.query.gql');

interface IMaterializedComparison {
    period: string;
    value: number;
    arrowDirection?: string;
}

interface IWidgetMaterializedFields {
    value?: number;
    format?: string;
    comparison?: IMaterializedComparison;
    chart?: string;
}

interface IPreviewWidgetResponse {
    previewWidget: {
        materialized?: IWidgetMaterializedFields;
    };
}

interface IChartWidgetAttributes {
    chart: string;
}

interface INumericWidgetAttributes {
    kpi: string;
    dateRange: IChartDateRange;
    comparison?: [string];
    comparisonArrowDirection?: string;
    format?: string;
    trending?: string;
}

interface IWidgetInput {
    preview?: boolean;
    order?: number;
    name: string;
    description?: string;
    type: string;
    size: string;
    color: string;
    numericWidgetAttributes?: INumericWidgetAttributes;
    chartWidgetAttributes?: IChartWidgetAttributes;
}

@Component({
    selector: 'kpi-widget-preview',
    templateUrl: './widget-preview.component.pug',
    styleUrls: ['./widget-preview.component.scss'],
    providers: [WidgetPreviewViewModel]
})
export class WidgetPreviewComponent implements OnInit, OnChanges {
    @Input() widgetData: IWidgetData;

    constructor(public vm: WidgetPreviewViewModel,
                private _apolloSvc: ApolloService,
                private _apollo: Apollo) {
        this.vm.initialize(null);
    }

    ngOnInit() {}

    ngOnChanges(data: SimpleChanges) {
        // eveytime the input data changes we should update the view model
        Object.assign(this.vm, clone(data['widgetData'].currentValue));

        if (!this.vm.valid) { return false; }

        if (this.vm.isAValidNumericWidget) {
            // handle valid numeric widget
            this._fetchNumericWidget();
        } else if (this.vm.isAValidChartWidget) {
            this._fetchChartWidget();
        }
    }

    private _fetchChartWidget(): void {
        const payload: IWidgetInput = {
            name: this.vm.name,
            type: this.vm.type,
            size: this.vm.size,
            color: 'white',
            chartWidgetAttributes: {
                chart: this.vm.chart
            }
        };

        const that = this;

        this._apolloSvc.networkQuery<IPreviewWidgetResponse>(
            previewWidgetQuery,
            { input: payload }
        )
        .then(preview => {
            that.vm.chartWidgetData = preview.previewWidget.materialized.chart;
        })
    }

    private _fetchNumericWidget(): void {
        const customDateRange = this.vm.dateRange.predefined === 'custom'
                                ? { from: this.vm.dateRange.custom.from, 
                                    to: this.vm.dateRange.custom.to }
                                : null;
        const dateRange = {
            predefined: this.vm.dateRange.predefined,
            custom: customDateRange
        };

        const payload: IWidgetInput = {
            preview: true,
            name: this.vm.name,
            type: this.vm.type,
            size: this.vm.size,
            color: this.vm.color,
            numericWidgetAttributes: {
                kpi: this.vm.kpi,
                dateRange: dateRange,
                comparison: this.vm.comparison
                            ? [this.vm.comparison]
                            : null,
                comparisonArrowDirection: this.vm.comparisonArrowDirection,
            }
        };
        const that = this;
        this._apolloSvc.networkQuery<IPreviewWidgetResponse>(
            previewWidgetQuery,
            { input: payload }
        )
        .then(preview => {
            const materialized: IWidgetMaterializedFields = preview.previewWidget.materialized;
            that.vm.numericWidgetData = {
                value: materialized.value,
            };

            if (materialized.comparison) {
                that.vm.numericWidgetData.comparison = {
                    value: materialized.comparison.value,
                    period: materialized.comparison.period,
                    arrowDirection: materialized.comparison.arrowDirection
                };
            }
        });
    }

}

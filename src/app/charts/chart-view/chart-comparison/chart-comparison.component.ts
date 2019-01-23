import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChartData } from '../chart-view.component';
import { ApolloService } from 'src/app/shared/services/apollo.service';
import { parseComparisonDateRange, IDateRangeItem } from 'src/app/shared/models';

export interface IComparisonInfo {
    id: string;
    title: string;
    payload: string;
}

const kpiOldestDateQuery = require('graphql-tag/loader!../../shared/ui/chart-basic-info/kpi-get-oldestDate.gql');

@Component({
    selector: 'kpi-chart-comparison',
    templateUrl: './chart-comparison.component.pug',
    styleUrls: ['./chart-comparison.component.scss'],
})
export class ChartComparisonComponent implements OnInit {
    @Input() chartData: ChartData;
    @Input() dateRanges: IDateRangeItem[] = [];

    @Output() comparisonSelected = new EventEmitter<IComparisonInfo>();

    comparisons: IComparisonInfo[];

    constructor(private _apolloService: ApolloService) {}

    ngOnInit() {
        this._getComparisonOptions();
    }

    comparisonClicked(item: IComparisonInfo) {
        this.comparisonSelected.emit(item);
    }

    close() {
        this.comparisonSelected.emit(null);
    }

    private _getComparisonOptions() {
        /**
         * this is being called inside a setTimeout
         * when navigating dashboards, this.chartData would be a null value
         */
        if (this.chartData) {
            const dateRangeString = this.chartData.dateRange[0].predefined || 'custom';
            // const compareAction = this.compareActions.find(action => action.id === 'comparison');
            const emptyChildrens = undefined;

            // if (
            //     !dateRange ||
            //     (options && options.disabled) ||
            //     (this.chartDefinitionChartTypeExist && this.chartData.chartDefinition.chart.type === 'pie')
            // ) {
            //     if (compareAction) {
            //         compareAction.children = emptyChildrens;
            //     }
            //     return;
            // }

            const kpiIds = this.chartData.kpis.map(k => k.kpi._id); // [0]._id;
            this._apolloService.networkQuery<string>(kpiOldestDateQuery, { ids: kpiIds }).then(kpis => {
                const dateRange = this.dateRanges.find(d => d.dateRange.predefined === dateRangeString);
                this.comparisons = this.updateComparisonData(dateRange, kpis.getKpiOldestDate);
                // change array reference when updating compare actions
                // this.compareActions = [
                //     ...this.compareActions
                // ];
            });
        }
    }

    private updateComparisonData(dateRange: any, yearOldestDate: string): any[] {
        const itemsComparison = [dateRange, ''];
        const childrens = [];
        dateRange.comparisonItems.map(item => {
            itemsComparison[1] = item.key;
            const yearofDateFrom = parseComparisonDateRange(<any>itemsComparison, itemsComparison[0]).from.getFullYear();
            if (yearofDateFrom >= parseInt(yearOldestDate, 0)) {
                childrens.push({
                    id: 'comparison',
                    title: item.value,
                    payload: item.key
                });
            }
        });
        return childrens.length > 0 ? childrens : undefined;
    }
}

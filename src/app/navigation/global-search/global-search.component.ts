import { CommonService } from '../../shared/services/common.service';
import { Store } from '../../shared/services/store.service';
import { Router } from '@angular/router';
import { AppStateService } from '../../shared/services/app-state.service';
import { IChart } from '../../charts/shared/models/chart.models';
import { IChartInput } from '../../charts/shared/models';
import { CreateChartMutation } from '../../charts/shared/graphql/charts.gql';
import { IMutationResponse } from '../../shared/models/mutation-response';
import { Subscription } from 'rxjs/Subscription';
import { FormGroup } from '@angular/forms';
import { Component, OnDestroy, OnInit, Input, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import {
    Apollo
} from 'apollo-angular';
import gql from 'graphql-tag';
import { isString } from 'lodash';
import { SearchResultViewModel } from './search-results/search-results.viewmodel';
import { sortBy } from 'lodash';

/**
 * give me last month sales grouped by location and service type with a monthly frequency on a column chart
 * give me last month sales grouped by location and service type with a monthly frequency on a bar chart
 */

const SearchQuery = gql `
    query Search($sections: [String]!, $query: String!) {
        search(sections: $sections, query: $query) {
            section
            items {
                name
                data
            }
        }
    }
`;

interface SearchResponse {
    search: SearchResult[];
}

interface SearchResult {
    section: string;
    items: any[];
}

interface SearchResultItem {
    name: string;
    data: string;
}

const SearchSectionsMap = {
    Chart: 'chart',
    Items: 'items'
};

@Component({
    selector: 'kpi-global-search',
    templateUrl: './global-search.component.pug',
    styleUrls: ['./global-search.component.scss'],
    providers: [SearchResultViewModel]
})
export class GlobalSearchComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() showSearchPage = false;

    @Output() closed = new EventEmitter<void>();
    private _inputs: any;

    resultDisplayStyle = 'none';
    searchPadding = '20% 10%';
    fg: FormGroup = new FormGroup({});

    // properties to fulfill research results
    chart: IChart;

    private _subscription: Subscription[] = [];

    constructor(private _apollo: Apollo,
                private _store: Store,
                private _router: Router,
                public vm: SearchResultViewModel,
                private el: ElementRef) {
    }

    ngOnInit() {
        const that = this;

        this._subscription.push(
            this.fg.valueChanges.debounceTime(500).subscribe(changes => {
                if (changes.query) {
                    that.chart = null;
                    // that.resultDisplayStyle = 'block';
                    that.searchPadding = '2%';
                    that._queryDashboardSmartBar(changes.query);
                } else {
                    that.resultDisplayStyle = 'none';
                    that.searchPadding = '20% 10%';

                    const dataCollection = [];
                    that.vm.updateResultGroups(dataCollection);
                }
            })
        );
    }

    ngAfterViewInit() {
        // Is against angular best practices not to use ViewChild or ContentChild
        // but I couldnt get the child input element than using the querySelectorAll api
        // After the view is init I'm getting all the input childrens
        this._inputs = this.el.nativeElement.querySelectorAll('input');
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    showGlobalSearch() {
        this.showSearchPage = true;

        // Is against angular best practices not to use ViewChild or ContentChild
        // but I couldnt get the child input element than using the querySelectorAll api
        // After the view is init I'm getting all the input childrens
        this._inputs[1].focus();
    }

    hideGlobalSearch() {
        this.showSearchPage = false;
        this.fg.reset();
        this.closed.emit();
    }

    clearAndHideGlobalSerach() {
        this.fg.controls['query'].setValue('');
        this.chart = undefined;
        this.hideGlobalSearch();
    }

    saveChart() {
        if (!this.chart) { return; }

        const that = this;
        this._subscription.push(
            this._apollo.mutate<{ createChart: IMutationResponse }>({
                mutation: CreateChartMutation,
                variables: { input: that._transformToChartInputModel(this.chart) }
            })
            .subscribe(response => {
                if (response.data.createChart.entity) {
                    that.clearAndHideGlobalSerach();
                }

                if (response.data.createChart.errors) {
                    // perform an error message
                    // console.log(response.data.createChart.errors);
                }
            })
        );
    }

    editChart() {
        if (!this.chart) { return; }

        this._store.pushDataObject({ id: 'new-chart',
                                     data: this.chart
                                   });

        this.clearAndHideGlobalSerach();
        this._router.navigateByUrl('charts/new');
    }

    private _processSearchResponse(result: SearchResult[]) {
        if (!result) {
            return;
        }

        const that = this;
        let dataCollection = [];

        result.forEach(i => {
            switch (i.section) {
                case SearchSectionsMap.Chart:
                    that.chart = JSON.parse(i.items[0].data);
                    that.resultDisplayStyle = 'none';
                    break;
                case SearchSectionsMap.Items:
                    // parse json
                    const items = i.items.map(it => ({
                        name: it.name,
                        data: JSON.parse(it.data)
                    }));

                    dataCollection = dataCollection.concat(items);
                    break;
                default:
                    break;
            }
        });

        const dataTypeCollection = this.vm.dataTypeCollection;
        dataCollection.map(data => {
            const dataTypeValue = dataTypeCollection.find(type => type.name === data.name);

            if (!dataTypeValue) {
                return;
            }

            data.color = dataTypeValue.color;
            data.icon = dataTypeValue.icon;
            data.order = dataTypeValue.order;
            data.enabled = dataTypeValue.enabled;
            data.uriFormat = dataTypeValue.uriFormat;
        });

        const sortedDataCollection = sortBy(dataCollection, (d) => d.order);
        that.vm.updateResultGroups(sortedDataCollection as any);
    }

    private _transformToChartInputModel(chart: IChart): IChartInput {
        return {
            title: chart.title,
            kpis: [chart.kpis[0]._id],
            dateRange: chart.dateRange,
            frequency: chart.frequency,
            groupings: chart.groupings,
            chartDefinition: JSON.stringify(chart.chartDefinition),
            comparison: [],
            xAxisSource: '',
            dashboards: []
        };
    }

    /**
     * this is for the global search bar
     * @param query
     */
    private _queryDashboardSmartBar(query: string): void {
        if (!query || !isString(query)) { return; }
        const that = this;

        this._subscription.push(
            this._apollo.watchQuery < SearchResponse > ({
                query: SearchQuery,
                variables: {
                    sections: ['all'],
                    query: query
                },
                fetchPolicy: 'network-only'
            }).valueChanges.subscribe(({data}) => {
                if (!data || !data.search) {
                    return;
                }

                that._processSearchResponse(data.search);
            })
        );
    }

}

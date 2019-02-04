import { IExternalDataSource } from './../../../shared/domain/kpis/data-source';
import { IDataSource } from 'src/app/shared/domain/kpis/data-source';
import { IKPI } from './../../../shared/domain/kpis/kpi';
import { SelectionItem } from '../../../ng-material-components/models';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';

import { ChartViewComponent, DateRange } from '..';
import { DialogResult } from '../../../shared/models/dialog-result';
import { ChartData } from '../chart-view.component';
import gql from 'graphql-tag';
import { ApolloService } from '../../../shared/services/apollo.service';
import * as moment from 'moment';

export const SettingsOnFlyKpisQuery = gql `
    query {
        settingOnFlyKpis {
            _id
            name
            groupingInfo {
                value
                name
            }
            type
        }
    }
`;

const kpiQuery = require('graphql-tag/loader!./kpi.gql');
const dataSourcesQuery = require('graphql-tag/loader!./data-sources.gql');
const externalDataSourcesQuery = require('graphql-tag/loader!./external-data-sources.query.gql');

@Component({
    selector: 'kpi-change-settings-on-fly',
    templateUrl: './change-settings-on-fly.component.pug',
    styleUrls: ['./change-settings-on-fly.component.scss'],
})
export class ChangeSettingsOnFlyComponent implements OnInit {
    @Input() chartData: ChartData;
    @Output() done = new EventEmitter < DialogResult > ();

    fg: FormGroup;
    groupingList: SelectionItem[] = [];
    dateRange: any;
    frequency: any;
    grouping: string[];
    filters: FormArray;
    kpi: IKPI;
    // isChangedValue: boolean;
    chartType: string;
    isLoading = true;
    dataSources: IDataSource;
    expression: any;

    constructor(private _chartViewComponent: ChartViewComponent,
                private _apolloService: ApolloService) {}

    async ngOnInit() {
        this._getValueFromChart();
        await this._getKpiInfo(this.chartData.kpis[0].kpi._id);
        await this._getGroupingList();
        await this._getDataSources();
        this.chartType = this.chartData.chartDefinition.chart.type;
        this._setValueToForm();
        this.isLoading = false;
    }

    updateChart() {
        this._changeSettingsOnFly();
        this.done.emit(DialogResult.PREVIEW);
    }

    back() {
        this.done.emit(DialogResult.CANCEL);
    }

    private async _getDataSources() {
        switch (this.kpi.type) {
            case 'simple':
                await this._getSimpleDataSources();
                break;
            case 'externalsource':
                await this._getExternalDataSources();
                break;
        }
    }

    private async _getSimpleDataSources() {
        const that = this;

        await this._apolloService.networkQuery<{ dataSources: IDataSource[] }>(dataSourcesQuery)
            .then(res => {
                that._updateDataSources(res.dataSources, this.kpi.type);
            });
    }

    private async _getExternalDataSources() {
        const that = this;

        await this._apolloService.networkQuery<{ externalDataSources: IExternalDataSource[] }>(externalDataSourcesQuery)
            .then(res => {
                that._updateDataSources(res.externalDataSources, this.kpi.type);
            });
    }

    private _updateDataSources(dataSources: IDataSource[], kpiType: string) {
        if (!dataSources) {
            return;
        }
        this.dataSources = <any>dataSources.find(d => (kpiType === 'externalsource' ? d['id'] : d.name) === this.expression.dataSource);
    }

    get selectedDataSource(): IDataSource {
        if (!this.expression) { return; }
        return (this.dataSources) as IDataSource;
    }

    private _getGroupingList() {
        this._apolloService.networkQuery < SelectionItem > (SettingsOnFlyKpisQuery)
        .then(kpis => {
            const kpi = kpis.settingOnFlyKpis.find(k => k._id === this.chartData.kpis[0].kpi._id);
            if (kpi) {
                this.groupingList = kpi.groupingInfo.map(g => new SelectionItem(g.value, g.name));
            }
        });
    }

    private _getValueFromChart() {
        this.dateRange = this.chartData.dateRange[0];
        if (this.dateRange.predefined === 'custom') {
            this.dateRange.custom.from = moment(this.chartData.dateRange[0].custom.from).format('MM/DD/YYYY');
            this.dateRange.custom.to = moment(this.chartData.dateRange[0].custom.to).format('MM/DD/YYYY');
        }
        this.frequency = this.chartType !== 'pie' ? this.chartData.frequency : null;
        this.grouping = this.chartData.groupings;
    }

    private _setValueToForm() {
        this.fg = new FormGroup({
            predefinedDateRange: new FormControl(this.dateRange.predefined),
            from: new FormControl(this.dateRange.custom ? this.dateRange.custom.from : null),
            to: new FormControl(this.dateRange.custom ? this.dateRange.custom.to : null),
            frequency: new FormControl(this.frequency),
            groupings: new FormControl(this.grouping),
            filters: new FormArray([this.filters])
        });
    }

    private _changeSettingsOnFly() {
        const value = this.fg.value;

        if (!value.filters[0][0] || !value.filters[0][0].field) {
            value.filters[0] = undefined;
        }

        const dateRange: DateRange = {
            from: value.from,
            to: value.to
        };

        this._chartViewComponent.setSettingsOnFly(value.predefinedDateRange, dateRange,
             value.frequency, value.groupings, value.filters[0]);
    }

    private async _getKpiInfo(id: string): Promise < IKPI > {
        return this._apolloService.networkQuery < IKPI > (kpiQuery, {
                id: id
            })
            .then(res => {
                if (res.kpi) {
                    this.kpi = res.kpi;
                    this.expression = this.kpi.type !== 'complex' ? JSON.parse(res.kpi.expression) : res.kpi.expression;

                    this.filters = new FormArray([new FormGroup({})]);
                    this.filters.controls = [];
                    if (this.kpi.filter) {
                        const fgFilter = JSON.parse(this.kpi.filter).filter(f => f.field !== 'source');
                        fgFilter.map(filter => {
                            this.filters.push(
                                new FormGroup({
                                    'field': new FormControl(filter.field),
                                    'operator': new FormControl(filter.operator),
                                    'criteria': new FormControl(filter.criteria)
                                })
                            );
                        });
                    }
                }
            });
    }

    get isValid() {
        return this.fg && this.fg.valid;
    }

    get showCollapsedFilters() {
        return !this.filters.length;
    }

}

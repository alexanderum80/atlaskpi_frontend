import { CommonService } from '../../shared/services/common.service';
import {AfterViewInit, Component, ViewChild, OnDestroy, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { pick, isString, isEqual } from 'lodash';

import { DialogResult } from '../../shared/models/dialog-result';
import { TargetService } from '../chart-view/set-goal/shared/target.service';
import { prepareChartDefinitionForPreview } from '../shared/extentions';
import { SingleChartQuery, UpdateChartMutation } from '../shared/graphql/charts.gql';
import { ChartModel, IChart, IUpdateChartResponse, SingleChartResponse } from '../shared/models';
import { ChartFormComponent } from '../shared/ui/chart-form';
import Sweetalert from 'sweetalert2';
import { SelectedChartsService } from '../shared';
import { ApolloService } from '../../shared/services/apollo.service';


const Highcharts = require('highcharts/js/highcharts');
const getChartByTitle = require('graphql-tag/loader!../shared/graphql/get-chart-by-title.gql');

@Component({
  selector: 'kpi-edit-chart',
  templateUrl: './edit-chart.component.pug',
  styleUrls: ['./edit-chart.component.scss'],
  providers: [TargetService]
})
export class EditChartComponent implements AfterViewInit, OnDestroy, OnInit {
    @ViewChild(ChartFormComponent) private chartFormComponent: ChartFormComponent;
    fg: FormGroup = new FormGroup({});

    chart: IChart;
    id: string;
    chartModel: ChartModel;
    loading = true;

    removeTargetData: any = {};

    private _chartModel: IChart;
    private _subscription: Subscription[] = [];

    constructor(private _apollo: Apollo,
                private _apolloService: ApolloService,
                private _router: Router,
                private _route: ActivatedRoute,
                private _selectChartService: SelectedChartsService,
                private _TargetService: TargetService) {
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    ngOnInit() {
        this._selectChartService.updateExistDuplicatedName(false);
    }

    ngAfterViewInit() {
        const that = this;
        this._subscription.push(this._route.params
            .do((params: Params) => that.id = params['id'])
            .switchMap((params: Params) => that._getChartByIdApolloQuery(params['id']))
            .subscribe((response: ApolloQueryResult<any>) => {
               setTimeout(() => {
                that._setRemoveTargetData(response);
                that._processChartResponse(response);
               }, 500);
        }));

    }

    onChartFormEvent($event: DialogResult) {
        switch ($event) {
          case DialogResult.CANCEL:
               return this._router.navigateByUrl('/charts');

          case DialogResult.SAVE:
               return this.updateChart();
        }
    }

    cancel() {
        this._router.navigateByUrl('/charts/list');
    }

    updateChart() {
        const that = this;

        this._selectChartService.updateExistDuplicatedName(false);

        this._apolloService.networkQuery < IChart > (getChartByTitle, { title: this.fg.controls.name.value }).then(d => {
            if (d.getChartByTitle && d.getChartByTitle._id !== this.id) {
                this._selectChartService.updateExistDuplicatedName(true);

                this.fg.controls['name'].setErrors({forbiddenName: true});

                return Sweetalert({
                    title: 'Duplicated name!',
                    text: 'You already have a Chart with that name. Please change the name and try again.',
                    type: 'error',
                    showConfirmButton: true,
                    confirmButtonText: 'Ok'
                  });
            }

            this.chartFormComponent.processFormatChanges(this.fg.value);
            const model = ChartModel.fromFormGroup(this.fg, this.chartFormComponent.getChartDefinition(), true);

            this._apollo.mutate<IUpdateChartResponse>({
                mutation: UpdateChartMutation,
                variables: { id: that.id, input: model }
            })
            .toPromise()
            .then(response => {
                if (response.data.updateChart.success) {
                    this._router.navigateByUrl('/charts/list');

                    if (!this._canRemoveTargetFromChart()) {
                        this._TargetService.removeTargetFromEditChart(that.id);
                    }
                }

                if (response.data.updateChart.errors) {
                    // perform an error message
                    console.log(response.data.updateChart.errors);
                }
            })
            .catch(err => console.log(err));
        });
    }

    private _canRemoveTargetFromChart(): boolean {
        if (!this.removeTargetData) { return true; }

        const formValues = pick(this.fg.value, [
            'kpi',
            'predefinedDateRange',
            'frequency',
            'grouping',
            'xAxisSource',
            'predefinedTop'
        ]);

        return isEqual(this.removeTargetData, formValues);
    }

    private _processChartResponse(response: ApolloQueryResult<any>) {
        this.loading = false;

        if (!response.data.chart) {
            return this.id = null;
        }
        this.chart = JSON.parse(response.data.chart);
        // this.chartFormComponent.setChartDefinition(prepareChartDefinitionForPreview(this.chart.chartDefinition));
        this.chartModel = new ChartModel(this.chart);
        setTimeout(() => {
            this.chartModel.chartDefinition = prepareChartDefinitionForPreview(this.chart.chartDefinition);
            this.chartFormComponent.updateFormFields();
        }, 500);
    }

    private _getChartByIdApolloQuery(id: string): Observable<ApolloQueryResult<SingleChartResponse>> {
      return this._apollo.watchQuery <SingleChartResponse> ({
          query: SingleChartQuery,
          variables: {
            id: id
          },
          fetchPolicy: 'network-only'
        }).valueChanges;
    }

    private _setRemoveTargetData(response: any): void {
        const data = response.data;
        let chart;

        if (isString(data.chart)) {
            chart = JSON.parse(data.chart);
        }

        if (!chart) {
            return;
        }

        const kpi = chart.kpis.find(k => k);
        const dateRange = chart.dateRange.find(d => d.predefined);

        this.removeTargetData = {
            kpi: kpi ? kpi._id : null,
            predefinedDateRange: dateRange ? dateRange.predefined : null,
            frequency: chart.frequency,
            grouping: chart.groupings ? chart.groupings[0] : chart.groupings,
            xAxisSource: chart.xAxisSource,
            predefinedTop: chart.top ? chart.top.predefined : null
        };

    }

}

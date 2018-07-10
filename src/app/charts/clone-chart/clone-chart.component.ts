import { CommonService } from '../../shared/services/common.service';
import { Subscription } from 'rxjs/Subscription';
import { CloneChartActivity } from '../../shared/authorization/activities/charts/clone-chart.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';

import { DialogResult } from '../../shared/models/dialog-result';
import { prepareChartDefinitionForPreview } from '../shared/extentions';
import { CreateChartMutation, SingleChartQuery } from '../shared/graphql/charts.gql';
import { ChartModel, IChart, ISaveChartResponse, SingleChartResponse } from '../shared/models';
import { ChartFormComponent } from '../shared/ui/chart-form';

@Activity(CloneChartActivity)
@Component({
  selector: 'kpi-clone-chart',
  templateUrl: './clone-chart.component.pug',
  styleUrls: ['./clone-chart.component.scss'],
})
export class CloneChartComponent implements AfterViewInit, OnDestroy {
    @ViewChild(ChartFormComponent) private chartFormComponent: ChartFormComponent;
    fg: FormGroup = new FormGroup({});

    chart: IChart;
    chartModel: ChartModel;
    loading = true;

    private _chartModel: IChart;
    private _subscription: Subscription[] = [];

    constructor(private _apollo: Apollo,
                private _router: Router,
                private _route: ActivatedRoute) {
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    ngAfterViewInit() {
      const that = this;
      this._subscription.push(this._route.params
          .switchMap((params: Params) => that._getChartByIdApolloQuery(params['id']).valueChanges)
          .subscribe((response: ApolloQueryResult<any>) => {
            setTimeout(() => {
                that._processChartResponse(response);
               }, 500);
      }));
    }

    onChartFormEvent($event: DialogResult) {
        switch ($event) {
          case DialogResult.CANCEL:
               return this._router.navigateByUrl('/charts');

          case DialogResult.SAVE:
               return this.cloneChart();
        }
    }

    cancel() {
        this._router.navigateByUrl('/charts/list');
    }

    cloneChart() {
        const that = this;
        this.chartFormComponent.processFormatChanges(this.fg.value);
        const model = ChartModel.fromFormGroup(this.fg, this.chartFormComponent.getChartDefinition(), true);

        this._apollo.mutate<ISaveChartResponse>({
            mutation: CreateChartMutation,
            variables: { input: model }
        })
        .toPromise()
        .then(response => {
            if (response.data.createChart.success) {
                this._router.navigateByUrl('/charts/list');
            };

            if (response.data.createChart.errors) {
                // perform an error message
                console.dir(response.data.createChart.errors);
            };
        })
        .catch(err => console.log(err));
    }

    private _processChartResponse(response: ApolloQueryResult<any>) {
        this.loading = false;

        if (!response.data.chart) {
            return;
        }

        this.chart = JSON.parse(response.data.chart);

        // this is where we change the name of the chart
        this.chart._id = undefined;
        this.chart.title += ` (copy ${moment().format('H:mm:ss')})`;

        this.chartModel = new ChartModel(this.chart);
        setTimeout(() => {
        this.chartModel.chartDefinition = prepareChartDefinitionForPreview(this.chart.chartDefinition);
          this.chartFormComponent.updateFormFields();
        }, 200);
    }

    private _getChartByIdApolloQuery(id: string): QueryRef<SingleChartResponse> {
      return this._apollo.watchQuery <SingleChartResponse> ({
          query: SingleChartQuery,
          variables: {
            id: id
          },
          fetchPolicy: 'network-only'
        });
    }
}

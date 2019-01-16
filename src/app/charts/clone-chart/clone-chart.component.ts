import { map } from 'rxjs/operators';
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
import { CreateChartMutation, CreateMapMutation ,  SingleChartQuery, SingleMapQuery } from '../shared/graphql/charts.gql';
import { ChartModel, IChart, ISaveChartResponse, SingleChartResponse, SingleMapResponse } from '../shared/models';
import { ChartFormComponent } from '../shared/ui/chart-form';
import { MapModel } from '../../maps/shared/models/map.models';
import { IUserInfo } from '../../shared/models';
import { UserService } from '../../shared/services';

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
    map: any;
    chartModel: ChartModel;
    mapModel: MapModel;
    isChartOrMap = '';
    loading = true;

    private _chartModel: IChart;
    private _subscription: Subscription[] = [];

    private currentUser: IUserInfo;

    constructor(private _apollo: Apollo,
                private _router: Router,
                private _route: ActivatedRoute,
                private _userService: UserService) {
        this.currentUser = this._userService.user;
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    ngAfterViewInit() {
      const that = this;
      this._route.params.subscribe(param => {
        this.isChartOrMap = param['chartType'];
        if (this.isChartOrMap === 'chart') {
            this._subscription.push(this._route.params
                .switchMap((params: Params) => that._getChartByIdApolloQuery(params['id']).valueChanges)
                .subscribe((response: ApolloQueryResult<any>) => {
                  if (response.data.chart) {
                      setTimeout(() => {
                          that._processChartResponse(response);
                      }, 500);
                  }
            }));
        } else if (this.isChartOrMap === 'map') {
            this._subscription.push(this._route.params
                .switchMap((params: Params) => that._getMapByIdApolloQuery(params['id']).valueChanges)
                .subscribe((response: ApolloQueryResult<any>) => {
                  if (response.data.map) {
                      setTimeout(() => {
                          that._processMapResponse(response);
                      }, 500);
                  }
            }));
        }
      });
    }

    onChartFormEvent($event: DialogResult) {
        switch ($event) {
          case DialogResult.CANCEL:
               return this._router.navigateByUrl('/charts');

          case DialogResult.SAVE:
            if (this.isChartOrMap === 'chart') {
               return this.cloneChart();
            } else {
                return this.cloneMap();
            }
        }
    }

    cancel() {
        this._router.navigateByUrl('/charts/list');
    }

    cloneChart() {
        const that = this;
        this.chartFormComponent.processFormatChanges(this.fg.value);
        const model = ChartModel.fromFormGroup(this.fg, this.chartFormComponent.getChartDefinition(), true);

        // add-created-updated-by-date
        model.createdBy = this.currentUser._id;
        model.updatedBy = this.currentUser._id;
        model.createdDate = moment().toDate();
        model.updatedDate = moment().toDate();

        // Apollo doesnt send the property when using Link Batch, if the data type is not the same as in the schema
        // so we are forcing the daterange to be an array of DateRanges.
        (<any>model).dateRange = [model.dateRange];

        this._apollo.mutate<ISaveChartResponse>({
            mutation: CreateChartMutation,
            variables: { input: model }
        })
        .toPromise()
        .then(response => {
            if (response.data.createChart.success) {
                this._router.navigateByUrl('/charts/list');
            }

            if (response.data.createChart.errors) {
                // perform an error message
                console.dir(response.data.createChart.errors);
            }
        })
        .catch(err => console.log(err));
    }

    cloneMap() {
        const that = this;
        const model = MapModel.fromFormGroup(this.fg);

        // add-created-updated-by-date
        model.createdBy = this.currentUser._id;
        model.updatedBy = this.currentUser._id;
        model.createdDate = moment().toDate();
        model.updatedDate = moment().toDate();

        this._apollo.mutate<ISaveChartResponse>({
            mutation: CreateMapMutation,
            variables: { input: model }
        })
        .toPromise()
        .then(response => {
            if (response.data.createMap.success) {
                this._router.navigateByUrl('/charts/list');
            }

            if (response.data.createMap.errors) {
                // perform an error message
                console.dir(response.data.createMap.errors);
            }
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

    private _processMapResponse(response: ApolloQueryResult<any>) {
        this.loading = false;

        if (!response.data.map) {
            return;
        }

        this.map = JSON.parse(response.data.map);

        // this is where we change the name of the map
        this.map._id = undefined;
        this.map.title += ` (copy ${moment().format('H:mm:ss')})`;

        this.mapModel = new MapModel(this.map);
        setTimeout(() => {
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

    private _getMapByIdApolloQuery(id: string): QueryRef<SingleMapResponse> {
        return this._apollo.watchQuery <SingleMapResponse> ({
            query: SingleMapQuery,
            variables: {
              id: id
            },
            fetchPolicy: 'network-only'
          });
      }
}

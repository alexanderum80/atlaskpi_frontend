import { CommonService } from '../../shared/services/common.service';
import { ListChartService } from '../shared/services/list-chart.service';
import { SingleChartQuery } from '../shared/graphql';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ChartData, IChartVariable } from '../shared/models';
import { IChart } from '../shared/models/chart.models';
import { Apollo } from 'apollo-angular';
import { Chart } from 'angular-highcharts';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

interface SingleChartResponse {
  chart: string;
}

@Component({
  selector: 'kpi-chart-view-mini',
  templateUrl: './chart-view-mini.component.pug',
  styleUrls: ['./chart-view-mini.component.scss']
})
export class ChartViewMiniComponent implements OnInit, OnDestroy {
    @Input() item: IChart;
    @Input() title: string;

    private _subscription: Subscription[] = [];

    selected$: Observable<IChart>;
    inspectorOpen$: Observable<boolean>;

    chart: Chart;

    loading = true;

    constructor(private _apollo: Apollo,
                private _listChartService: ListChartService) { }

    ngOnInit() {
      this.selected$ = this._listChartService.selected$;
      this.inspectorOpen$ = this._listChartService.inspectorOpen$;
      this._subscribeToChartQuery();
    }

    ngOnDestroy() {
      CommonService.unsubscribe(this._subscription);
    }

    setActive() {
      this._listChartService.setActive(this.item);
      this._listChartService.showInspector();
    }

    private _simplifyChartDefinition(definition: any) {
      if (!definition) {
        return;
      }

      definition.exporting = definition.exporting || {};
      definition.exporting.enabled = false;
      definition.credits = { enabled: false };
      definition.legend = { enabled: false };
      definition.tooltip = { enabled: false };
      definition.plotOptions = definition.plotOptions || {};
      definition.plotOptions.series = definition.plotOptions.series || {};
      definition.plotOptions.series.enableMouseTracking = false;
      definition.title = undefined;
      definition.subtitle = undefined;
      return definition;
    }

    private _subscribeToChartQuery() {
      if (!this.item) {
          return;
      }

      const that = this;
      this._subscription.push(this._apollo.watchQuery <SingleChartResponse> ({
          query: SingleChartQuery,
          variables: {
            id: this.item._id
          },
          fetchPolicy: 'network-only'
        })
        .valueChanges.subscribe(response => {
            that.loading = false;
            const chart = JSON.parse(response.data.chart);
            chart.chartDefinition = that._simplifyChartDefinition(chart.chartDefinition);
            if (chart.chartDefinition && chart.chartDefinition.series) {
              that.chart = new Chart(chart.chartDefinition);
            }
        }));
    }
}

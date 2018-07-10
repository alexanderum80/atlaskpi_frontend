import { CommonService } from '../../shared/services/common.service';
import { ListChartService } from '../../charts/shared/services/list-chart.service';
import { SingleChartQuery } from '../../charts/shared/graphql';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ChartData, IChartVariable } from '../../charts/shared/models';
import { IChart } from '../../charts/shared/models/chart.models';
import { Apollo } from 'apollo-angular';
import { Chart } from 'angular-highcharts';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

interface SingleChartResponse {
  chart: string;
}

@Component({
  selector: 'kpi-chart-mini',
  templateUrl: './chart-mini.component.pug',
  styleUrls: ['./chart-mini.component.scss']
})
export class ChartMiniComponent implements OnInit, OnDestroy {
    @Input() item: IChart;
    @Input() title: string;

    selected$: Observable<IChart>;

    chart: Chart;

    loading = true;

    private _subscription: Subscription[] = [];

    constructor(private _apollo: Apollo,
                private _listChartService: ListChartService) { }

    ngOnInit() {
      this.selected$ = this._listChartService.selected$;
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
        definition.exporting = definition.exporting || { };
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
            that.chart = new Chart(chart.chartDefinition);
        }));
    }
}

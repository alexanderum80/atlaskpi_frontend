import { CommonService } from '../../shared/services/common.service';
import { Subscription } from 'rxjs/Subscription';
import { SelectedChartsService } from '../shared/services/selected-charts.service';
import { SingleChartQuery } from '../shared/graphql';
import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ChartData, IChartVariable } from '../shared/models';
import { IChart } from '../shared/models/chart.models';
import { Apollo } from 'apollo-angular';
import { Chart } from 'angular-highcharts';
import { Observable } from 'rxjs/Observable';

interface SingleChartResponse {
  chart: string;
}

@Component({
  selector: 'kpi-chart-view-dashboard',
  templateUrl: './chart-view-dashboard.component.pug',
  styleUrls: ['./chart-view-dashboard.component.scss']
})
export class ChartViewDashboardComponent implements OnInit, OnDestroy {
    @Input() item: IChart;
    @Input() title: string;
    @Input() minHeight = 0;
    @Input() selectable = true;

    private _subscription: Subscription[] = [];
    public selected = false;

    chart: Chart;

    loading = true;

    constructor(private _apollo: Apollo,
                private _selectedChartsService: SelectedChartsService,
                private _el: ElementRef) {}

    ngOnInit() {
      this._subscribeToChartQuery();
      this.areSelected(this.item._id);

      if (!this.selectable) {
        return;
      }

      this._subscription.push(this._selectedChartsService.selected$.subscribe(currentDashboard => {
        if (currentDashboard === this.item) {
          this.selected = !this.selected;
          this._selectedChartsService.updateSelected(this.item._id);
        } else {
          this.selected = this.selected;
        }
      }));

    }

    ngOnDestroy() {
      CommonService.unsubscribe(this._subscription);
    }

    toggleActive() {
      this._selectedChartsService.setActive(this.item);
    }

    private _simplifyChartDefinition(definition: any) {
        definition.exporting = definition.exporting || { };
        definition.exporting.enabled = false;
        definition.credits = { enabled: false };
        definition.legend = { enabled: true };
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

    private areSelected(id: string) {
      const x = this._selectedChartsService.selectedCharts.find(o => o === id);
      if (x) {
        this.selected = true;
      }
    }

}

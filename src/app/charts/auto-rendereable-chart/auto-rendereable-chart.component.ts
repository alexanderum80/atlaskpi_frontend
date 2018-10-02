import { SingleChartQuery } from '../shared/graphql';
import { Subscription } from 'apollo-client/util/Observable';
import { Apollo } from 'apollo-angular';
import { IChart } from '../shared/models';
import { Component, OnInit, Input } from '@angular/core';
import { Chart } from 'angular-highcharts';

@Component({
  selector: 'kpi-auto-rendereable-chart',
  templateUrl: './auto-rendereable-chart.component.pug',
  styleUrls: ['./auto-rendereable-chart.component.scss']
})
export class AutoRendereableChartComponent implements OnInit {
  @Input() item: IChart;
  @Input() title: string;
  @Input() minHeight = 0;
  @Input() autoRender = true;
  @Input() placeholderImg;

  chart: any; // Chart;
  loading = false;

  constructor(private _apollo: Apollo) { }

  ngOnInit() {
    if (this.autoRender) {
      this._queryChart();
    }
  }

  previewChart() {
    this._queryChart();
  }

  private _queryChart() {
    
      if (this.chart || !this.item) {
          return;
      }

      this.loading = true;

      const that = this;
      this._apollo.query<{ chart: string }> ({
          query: SingleChartQuery,
          variables: {
            id: this.item._id
          },
          fetchPolicy: 'network-only'
        })
        .toPromise()
        .then(response => {
            that.loading = false;
            const chart = JSON.parse(response.data.chart);
            chart.chartDefinition = that._simplifyChartDefinition(chart.chartDefinition);
            that.chart = new Chart(chart.chartDefinition);

            that.chart.ref$.subscribe(ref => {
              setTimeout(() => {
                  ref.reflow();
              }, 100);
          });
        });
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

  get placeholderVisible() {
    return !this.loading && !this.chart && !this.autoRender;
  }

  get placeholderHeight() {
    return Math.floor((this.minHeight || 120));
  }



}

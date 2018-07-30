import { CommonService } from '../../shared/services/common.service';
import { Subscription } from 'rxjs/Subscription';
import { DialogResult } from '../../shared/models/dialog-result';
import {Component, Input, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {Chart} from 'angular-highcharts';
import { TitleOptions, CreditsOptions, Options } from 'highcharts';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { FormatterFactory, yAxisFormatterProcess } from '../../dashboards/shared/extentions/chart-formatter.extention';
import { FormGroup, FormControl } from '@angular/forms';
import { MenuItem, SelectionItem } from '../../ng-material-components';

const ChartQuery = gql`
    query Chart($id: String!, $dateRange: ChartDateRangeInput!, $xAxisSource: String!, $frequency: String!, $grouping: String) {
      chart(id: $id, dateRange: $dateRange, xAxisSource: $xAxisSource, frequency: $frequency, grouping: $grouping) 
    }
`;

export interface ChartData {
  _id: string;
  dateFrom: string;
  dateTo: string;
  name: string;
  description: string;
  group: string;
  kpis: any[];
  chartDefinition: Options;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface IChartVariable {
  id: string;
  dateRange: DateRange;
  frequency; string;
}

export interface ChartResponse {
  chart: string;
}


@Component({
  selector: 'kpi-chart-test',
  templateUrl: './chart-test.component.pug',
  styleUrls: ['./chart-test.component.scss']
})
export class ChartTestComponent implements OnInit, OnDestroy {
  @Input() chartData: ChartData;

  private _subscription: Subscription[] = [];

  chart: Chart;
  title: string;
  description: string;
  showDescription = false;
  descriptionAnimation = 'fadeIn';
  targets: any[];
  selectedFrequency: string = null;

  fg: FormGroup = new FormGroup({
      fromDate: new FormControl(),
      toDate: new FormControl(),
  });

  frequencies: SelectionItem[] = [
    { id: 'daily', title: 'Daily' },
    { id: 'weekly', title: 'Weekly' },
    { id: 'monthly', title: 'Monthly' },
    { id: 'quarterly', title: 'Quarterly'},
    { id: 'yearly', title: 'Yearly' }
  ];



  constructor(private _apollo: Apollo) { }
  ngOnInit() {

    if (!this.chartData) {
      return;
    }

  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  private _processChartYAxisFormatterFunctions(definition: any) {
    if (definition.yAxis && definition.yAxis.labels && definition.yAxis.labels.formatter) {
      const formatterFactory = new FormatterFactory();
      definition.yAxis.labels.formatter = formatterFactory.getFormatter(definition.yAxis.labels.formatter).exec;
    }
    return definition;
  }

  private _processChartTooltipFormatter(definition: any) {
    debugger;
     if (definition.tooltip && definition.tooltip.formatter) {
      const formatterFactory = new FormatterFactory();
      definition.tooltip.formatter = formatterFactory.getFormatter(definition.tooltip.formatter).exec;
    }
    return definition;
  }

  private _processPieChartPercent(definition: any) {
     if (definition.plotOptions && definition.plotOptions.pie) {
      const formatterFactory = new FormatterFactory();
      definition.plotOptions.pie.dataLabels.formatter =
        formatterFactory.getFormatter(definition.plotOptions.pie.dataLabels.formatter).exec;
    }
    return definition;
  }

  refreshChart() {
    const that = this;
    debugger;
    this._subscription.push(this._apollo.watchQuery<ChartResponse>({
      query: ChartQuery,
      variables: { id: this.fg.value.chartId,
                  dateRange: { from: this.fg.value.dateFrom || this.chartData.dateFrom,
                                to: this.fg.value.dateTo || this.chartData.dateTo },
                  xAxisSource: this.fg.value.xAxisSource,
                  frequency: this.fg.value.frequency || 'monthly',
                  grouping: this.fg.value.grouping || null },
      fetchPolicy: 'network-only'
    })
    .valueChanges.subscribe(({data}) => {
      debugger;
          const rawChart: ChartData = JSON.parse(data.chart);
          let definition = this._processChartTooltipFormatter(rawChart.chartDefinition);
          yAxisFormatterProcess(definition);
          definition = this._processPieChartPercent(rawChart.chartDefinition);
          rawChart.chartDefinition = definition;
          this.chartData = rawChart;
          this._moveChartDataToCard();
          this.chart = new Chart(rawChart.chartDefinition);
    }));
  }

  private _moveChartDataToCard() {
     // move title to car header
    this.title = this.chartData.chartDefinition.title.text;
    this.chartData.chartDefinition.title.text = undefined;

    this.description = this.chartData.chartDefinition.subtitle.text;
    this.chartData.chartDefinition.subtitle.text = undefined;

    this.chartData.chartDefinition.credits = {
      enabled: false,
      href: 'http://www.atlaskpi.com',
      text: 'Powered by AtlasKPI'
    };
  }

}

import { Chart } from 'angular-highcharts';
import { DialogResult } from '../../../shared/models/dialog-result';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TableModeService } from './table-mode.service';
import { Subscription } from 'rxjs/Subscription';
import { SeriesObject, IndividualSeriesOptions } from 'highcharts';

interface IDataChart {
  frequency: string;
  groupings: any;
}

interface ITableMode {
  data: string[][];
  categories: string[];
}

@Component({
  selector: 'kpi-table-mode',
  templateUrl: './table-mode.component.pug'
})
export class TableModeComponent implements OnInit {
  @Output() done = new EventEmitter<DialogResult>();

  chart: any;
  chartData: IDataChart;

  tableFormat: string[][];
  categories: string[];
  title: string;

  private _subscription: Subscription[] = [];

  constructor(private _tableModeService: TableModeService) { }

  ngOnInit() {
    this._setChartData();
    this._setChart();
    this._tableView();
  }

  save(): void {
    this.done.emit(DialogResult.SAVE);
  }

  cancel(): void {
    this.done.emit(DialogResult.CANCEL);
  }

  private _tableView(): void {
    if (this._hasSeries()) {
      this.tableFormat = this._formatTable().data;
      this.categories = this._formatTable().categories;
      this.title = this.chart.options.exporting.filename;
    }
  }

  private _setChartData(): void {
    const that = this;
    this._tableModeService.tableModeData$.subscribe(item => {
      that.chartData = item;
    });
  }

  private _setChart(): void {
    const that = this;
    this._subscription.push(
      this._tableModeService.chart$.subscribe(chart => {
        that.chart = chart;
      })
    );
  }

  private _hasSeries(): boolean {
    return this.chart.options.series.length ? true : false;
  }

  private _formatTable(): ITableMode {
    if (!this._hasSeries()) { return; }

    // legend names: ['jason hall', 'register', 'kybella']
    let categories: string[] = this.chart.options.series.map((category: IndividualSeriesOptions) => category.name);

    if (this.chart.options.chart.type === 'pie') {
      categories = [];
      categories.push('Amount');
    }

    if (!this.chartData.frequency) {
      categories.unshift(this.chartData.groupings);
    } else {
      const frequencyExists = categories.find((c: string) => c === 'Frequency');
      if (!frequencyExists) {
        categories.unshift('Frequency');
      }
    }

    // xAxis labels, pie won't have xAxis
    // i.e. ['1', '2', '3'], ['Jan', 'Feb']
    const leftSideTableLabels: string[] = (this.chart.ref as any).series[0].xAxis ?
                                          (this.chart.ref as any).series[0].xAxis.categories :
                                          (this.chart.ref as any).series[0].data.map(d => d.name);
    const series: SeriesObject[] = this.chart.ref.series;
    const data: string[][] = [];

    for (let i = 0; i < leftSideTableLabels.length; i++) {
      data[i] = [];
      data[i][0] = leftSideTableLabels[i];

      for (let j = 0; j < series.length; j++) {
        // #(i.e. 2200) or null
        const yData: number|object = (<any>series[j]).processedYData[i];
        // convert null, undefined, empty to 0
        const y: string = yData ? yData.toString() : '0';

        data[i].push(parseFloat(y).toFixed(2));
      }
    }

    return {
      data: data,
      categories: categories
    };
  }

}

import { ChartData } from '../chart-view.component';
import { MenuItem } from '../../../ng-material-components';
import { FormGroup } from '@angular/forms';
import { DialogResult } from '../../../shared/models/dialog-result';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { Options } from 'highcharts';
import { cloneDeep } from 'lodash';

const Highcharts = require('highcharts/js/highcharts');

@Component({
  selector: 'kpi-download-chart-view',
  templateUrl: './download-chart-view.component.pug',
  styleUrls: ['./download-chart-view.component.scss']
})
export class DownloadChartViewComponent implements OnInit, OnDestroy {
  @Input() chartData: ChartData;
  @Input() childChart: Chart;
  @Input() title: string;
  @Output() done = new EventEmitter<DialogResult>();

  chart: Chart;

  printExtension: MenuItem[] = [
    { id: 'print-chart', title: 'Print Preview' },
    { id: 'print-csv', title: 'Excel' },
    { id: 'print-pdf', title: 'PDF' },
    { id: 'print-png', title: 'PNG' },
    { id: 'print-jpeg', title: 'JPEG' },
    { id: 'print-svg', title: 'SVG' }
  ];

  constructor() {}

  ngOnInit() {
    this.chart = cloneDeep(this.childChart);
    this.chart.ref.setTitle({
      text: this.title,
      style: {
        display: 'none'
      }
    });

  }

  ngOnDestroy() {
    this.chart.ref.setTitle({ text: null });
  }

  cancel() {
    this.done.emit(DialogResult.CANCEL);
  }

  chartDownload(item) {
    this.chart.ref.setTitle({ style: { display: 'block' }});

    switch (item.id) {
      case 'print-chart':
        this.chart.ref.print();
        break;
      case 'print-csv':
        (<any>this.chart.ref).downloadCSV();
        break;
      case 'print-pdf':
        this.chart.ref.exportChart({
          type: 'application/pdf',
          filename: this.filename,
          allowHTML: true
        }, this.chartOptions);
        break;
      case 'print-png':
        this.chart.ref.exportChart({
          type: 'image/png',
          filename: this.filename,
          allowHTML: true
        }, this.chartOptions);
        break;
      case 'print-jpeg':
        this.chart.ref.exportChart({
          type: 'image/jpeg',
          filename: this.filename,
          allowHTML: true
        }, this.chartOptions);
        break;
      case 'print-svg':
        this.chart.ref.exportChart({
          type: 'image/svg+xml',
          filename: this.filename,
          allowHTML: true
        }, this.chartOptions);
        break;
    }
    this.done.emit(DialogResult.CANCEL);
  }

  get chartOptions(): Options {
    const chartTitle: string = this.title ? this.title : 'AtlasKPI_Chart';

    return {
      title: {
        useHTML: true,
        text: `<h2>${chartTitle}</h2>`
      }
    };
  }

  get filename(): string {
    return this.title ? this._reformatTitle(this.title) : 'AtlasKPI_Chart';
  }

  private _reformatTitle(title: string) {
    return title.match(/\s+/) ? title.split(' ').join('_') : this.filename;
  }

}

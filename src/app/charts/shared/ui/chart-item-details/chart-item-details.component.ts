import { IChart } from '../../models/chart.models';
import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'kpi-chart-item-details',
  templateUrl: './chart-item-details.component.pug',
  styleUrls: ['./chart-item-details.component.scss']
})
export class ChartItemDetailsComponent implements OnInit {
  @Input() item: IChart;

  ngOnInit() {
  }

  safe(value) {
    return value || '-';
  }

  momentify(date) {
    return moment(date).toString();
  }
}

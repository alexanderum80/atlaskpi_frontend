import { Component, Input, OnInit } from '@angular/core';
import { IAmounts } from '../shared/models/activity-models';

@Component({
  selector: 'kpi-sales-activity',
  templateUrl: './sales-activity.component.pug',
  styleUrls: ['./sales-activity.component.scss']
})
export class SalesActivityComponent implements OnInit {
  @Input() sales: IAmounts;
  @Input() startDayDate: Date;

  viewDetails = false;
  countDataSource: number;

  ngOnInit() {
    this.countDataSource = this.sales[0].revenueSources.length;
  }

  showDetails() {
    this.viewDetails = true;
  }

  hideDetails() {
    this.viewDetails = false;
  }

}

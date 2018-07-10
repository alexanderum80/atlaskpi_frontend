import { IAmounts } from '../shared/models/activity-models';
import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'kpi-trends-sales-activity',
  templateUrl: './trends-sales-activity.component.pug',
  styleUrls: ['./trends-sales-activity.component.scss']
})
export class TrendsSalesActivityComponent implements OnInit {
  @Input() lastMonthSales: IAmounts;
  @Input() monthAvgSales: IAmounts;

  viewDetails = false;

  statusDescription: string;

  ngOnInit() {
    this._setStatusDescription();
  }

  public showDetails() {
    this.viewDetails = true;
  }

  public hideDetails() {
    this.viewDetails = false;
  }

  getMonth(month: string): string {
    if (!month) {
      return '';
    }
    return  moment(month, 'M').format('MMM');
  }

  private _setStatusDescription(): void {
    if (this.lastMonthSales && this.monthAvgSales) {
      const diff = this.lastMonthSales[0].total - this.monthAvgSales[0].amount;
      this.statusDescription = diff > 0 ? ' above ' : diff < 0 ? ' below ' : ' equal ';
    }
  }

}

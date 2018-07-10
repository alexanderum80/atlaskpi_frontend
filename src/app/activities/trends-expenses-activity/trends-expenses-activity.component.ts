import { Component, OnInit, Input } from '@angular/core';
import { IAmounts } from '../shared/models/activity-models';
import * as moment from 'moment';

@Component({
  selector: 'kpi-trends-expenses-activity',
  templateUrl: './trends-expenses-activity.component.pug',
  styleUrls: ['./trends-expenses-activity.component.scss']
})
export class TrendsExpensesActivityComponent implements OnInit {
  @Input() lastMonthExpenses: IAmounts;
  @Input() monthAvgExpenses: IAmounts;

  viewDetails = false;

  statusDescription: string;

  ngOnInit() {
    this._setStatusDescription();
  }

  showDetails() {
    this.viewDetails = true;
  }

  hideDetails() {
    this.viewDetails = false;
  }

  getMonth(month: string): string {
    if (!month) {
      return '';
    }
    return  moment(month, 'M').format('MMM');
  }

  private _setStatusDescription(): void {
    if (this.lastMonthExpenses && this.monthAvgExpenses) {
      const diff = this.lastMonthExpenses[0].total - this.monthAvgExpenses[0].amount;
      this.statusDescription = diff > 0 ? ' above ' : diff < 0 ? ' below ' : ' equal ';
    }
  }

}

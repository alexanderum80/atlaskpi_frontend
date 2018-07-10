import { Component, OnInit, Input } from '@angular/core';
import { IAmounts } from '../shared/models/activity-models';

@Component({
  selector: 'kpi-expenses-activity',
  templateUrl: './expenses-activity.component.pug',
  styleUrls: ['./expenses-activity.component.scss']
})
export class ExpensesActivityComponent implements OnInit {
  @Input() expenses: IAmounts;
  @Input() startDayDate: Date;

  viewDetails = false;
  countDataSource: number;

  ngOnInit() {
    this.countDataSource = this.expenses[0].expenses.length;
  }

  showDetails() {
    this.viewDetails = true;
  }

  hideDetails() {
    this.viewDetails = false;
  }

}

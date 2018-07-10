import { Component, OnInit, Input } from '@angular/core';
import { IAmounts } from '../shared/models/activity-models';

@Component({
  selector: 'kpi-counts-activity',
  templateUrl: './counts-activity.component.pug',
  styleUrls: ['./counts-activity.component.scss']
})
export class CountsActivityComponent implements OnInit {
  @Input() sales: IAmounts;
  @Input() startDayDate: Date;

  viewDetails = false;
  countDataSource: number;

  ngOnInit() {
    this.countDataSource = this.sales[0].revenueSources.length;
  }

  public showDetails() {
    this.viewDetails = true;
  }

  public hideDetails() {
    this.viewDetails = false;
  }

}

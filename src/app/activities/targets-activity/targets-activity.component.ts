import { ActivitiesViewModel } from '../activities.viewmodel';
import { IAmounts } from '../shared/models/activity-models';
import { Component, Input, OnInit } from '@angular/core';
import { ITarget } from '../../charts/chart-view/set-goal/shared/targets.interface';
import { ApolloService } from '../../shared/services/apollo.service';

const salesAmountByDateRangeQuery = require('../shared/querys/sales-amount-by-dateRange.gql');

@Component({
  selector: 'kpi-targets-activity',
  templateUrl: './targets-activity.component.pug',
  styleUrls: ['./targets-activity.component.scss']
})
export class TargetsActivityComponent implements OnInit {
  @Input() target: ITarget;

  sales: IAmounts;

  viewDetails = false;
  status = 'successfully met';
  salesAmount = 0;

  constructor(
    private _apolloService: ApolloService,
    private vm: ActivitiesViewModel
  ) {}

  ngOnInit() {
    const that = this;

    const _from = that.vm.getFirstDayLastMonthDate();
    const _to = that.vm.getTodayDate();

    this._apolloService.networkQuery < IAmounts > (salesAmountByDateRangeQuery, { from: _from, to: _to })
    .then(sales => {
      if (sales.salesAmountByDateRange.length > 0) {
        that.vm.updateTargetSales(sales.salesAmountByDateRange);

        that.salesAmount = that.vm.targetSales[0].total;

        if (this.target.target > that.salesAmount) {
          this.status = 'not ' + this.status;
        }
      }
    });

  }

  public showDetails() {
    this.viewDetails = true;
  }

  public hideDetails() {
    this.viewDetails = false;
  }

  get targetName(): string {
    const uncategorized = 'Uncategorized*';
    if (!this.target) {
      return uncategorized;
    }

    return this.target.stackName ||
           this.target.nonStackName ||
           uncategorized;
  }

}

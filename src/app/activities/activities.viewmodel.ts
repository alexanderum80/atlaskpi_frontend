// Angular Imports
import {
  Injectable
} from '@angular/core';

import * as moment from 'moment';

// App Code
import {
  Field,
  ViewModel
} from '../ng-material-components/viewModels';

import { IAmounts, ISales, IUsersActivity } from './shared/models/activity-models';
import { IEmployee } from '../employees/shared/models/employee.model';
import { ITarget } from '../charts/chart-view/set-goal/shared/targets.interface';
import { UsersModule } from '../users/users.module';
import { isEmpty } from 'lodash';

interface IFilter {
  search: string;
}

@Injectable()
export class ActivitiesViewModel extends ViewModel<IFilter> {
  yesterdaySales: IAmounts;
  yesterdaySalesEmployee: IAmounts;
  lastMonthSales: IAmounts;
  monthAvgSales: IAmounts;
  lastMonthExpenses: IAmounts;
  monthAvgExpenses: IAmounts;
  yesterdayExpenses: IAmounts;
  employeeSales: IEmployee;
  yesterdayTarget: ITarget;
  targetSales: IAmounts;
  usersActivity: IUsersActivity;

  @Field({ type: String })
  search: string;

  constructor() {
    super(null);
  }

  initialize(model: IFilter): void {
      this.onInit(model);
  }

  getTodayDate() {
    return moment().startOf('day').toDate();
  }

  getYesterdayDate() {
    return moment().subtract(1, 'day').startOf('day').toDate();
  }

  getFirstDayLastMonthDate() {
    return moment().subtract(1, 'day').startOf('month').toDate();
  }

  isFirtsDayOfMonth() {
    if (moment().startOf('day').toDate().getUTCDate() === 1) {
      return true;
    } else {
      return false;
    }
  }

  updateYesterdaySales(data: IAmounts) {
    this.yesterdaySales = data;
  }

  updateYesterdaySalesEmployee(data: IAmounts) {
    this.yesterdaySalesEmployee = data;
  }

  updateLastMonthSales(data: IAmounts) {
    this.lastMonthSales = data;
  }

  updateMonthAvgSales(data: IAmounts) {
    this.monthAvgSales = data;
  }

  updateLastMonthExpenses(data: IAmounts) {
    this.lastMonthExpenses = data;
  }

  updateMonthAvgExpenses(data: IAmounts) {
    this.monthAvgExpenses = data;
  }

  updateYesterdayExpenses(data: IAmounts) {
    this.yesterdayExpenses = data;
  }

  updateEmployeeSales(data: IEmployee) {
    this.employeeSales = data;
  }

  updateYesterdayTarget(data: ITarget) {
    this.yesterdayTarget = data;
  }

  updateTargetSales(data: IAmounts) {
    this.targetSales = data;
  }

  updateUsersActivity(data: IUsersActivity) {
    this.usersActivity = data;
  }

  get isThereUserActivity() {
    if (this.usersActivity) {
      return true;
    } else {
      return false;
    }
  }

  get isThereLastMonthSales() {
    if (this.lastMonthSales) {
      return true;
    } else {
      return false;
    }
  }

  get isThereMonthAvgSales() {
    if (this.monthAvgSales) {
      return true;
    } else {
      return false;
    }
  }

  get isThereLastMonthExpenses() {
    if (this.lastMonthExpenses) {
      return true;
    } else {
      return false;
    }
  }

  get isThereMonthAvgExpenses() {
    if (this.monthAvgExpenses) {
      return true;
    } else {
      return false;
    }
  }

  get isThereYesterdaySales() {
    if (this.yesterdaySales) {
      return true;
    } else {
      return false;
    }
  }

  get isThereEmployeeSales(): boolean {
    let hasEmployeeSales = false;
      if (Array.isArray(this.yesterdaySalesEmployee) &&
          !isEmpty(this.yesterdaySalesEmployee[0]) &&
          this.yesterdaySalesEmployee[0].employee) {
          hasEmployeeSales = true;
    }
    return hasEmployeeSales;
  }

  get isThereYesterdayExpenses() {
    if (this.yesterdayExpenses) {
      return true;
    } else {
      return false;
    }
  }

  get isThereYesterdayTarget() {
    if (this.yesterdayTarget) {
      return true;
    } else {
      return false;
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';

import { ActivityFeedActivity } from '../shared/authorization/activities/feed/activity-feed.activity';
import { IUserInfo } from '../shared/models/user';
import { ApolloService } from '../shared/services/apollo.service';
import { UserService } from '../shared/services/user.service';
import { ActivitiesViewModel } from './activities.viewmodel';
import { IAmounts } from './shared/models/activity-models';

const salesAmountByDateRangeQuery = require('graphql-tag/loader!./shared/querys/sales-amount-by-dateRange.gql');
const salesEmployeeByDateRangeQuery = require('graphql-tag/loader!./shared/querys/sales-employee-by-dateRange.gql');
const monthAvgSalesQuery = require('graphql-tag/loader!./shared/querys/month-avg-sales.gql');
const expensesAmountByDateRangeQuery = require('graphql-tag/loader!./shared/querys/expenses-amount-by-dateRange.gql');
const monthAvgExpensesQuery = require('graphql-tag/loader!./shared/querys/month-avg-expenses.gql');
const targetByDateQuery = require('graphql-tag/loader!./shared/querys/target-by-date.gql');
const usersActivityByDateRangeQuery = require('graphql-tag/loader!./shared/querys/users-activity-by-dateRange.gql');


@Component({
  selector: 'kpi-activities',
  templateUrl: './activities.component.pug',
  styleUrls: ['./activities.component.scss'],
  providers: [ActivitiesViewModel]
})
export class ActivitiesComponent implements OnInit, AfterViewInit {
  startDayDate: Date;

  private _user: IUserInfo;

  constructor(
    private _apolloService: ApolloService,
    private _userSvc: UserService,
    public activityFeedActivity: ActivityFeedActivity,
    public vm: ActivitiesViewModel
  ) {
    const that = this;

    this.vm.addActivities([this.activityFeedActivity]);
    this._userSvc.user$.subscribe(currentUser => {
      that._user = currentUser;
    });
  }

  ngOnInit() {
    const that = this;

    if (!this.vm.initialized) {
        this.vm.initialize(null);
    }
  }

  ngAfterViewInit() {
    this.getYesterdaySales();
    this.getMaxYesterdaySalesEmployee();
    this.getTrendsLastMonthSales();
    this.getYesterdayExpenses();
    this.getTrendsLastMonthExpenses();
    this.getUsersActivities();
  }

  getYesterdaySales() {
    const that = this;

    const _from = that.vm.getYesterdayDate();
    const _to = that.vm.getTodayDate();

    this.startDayDate = _to;

    this._apolloService.networkQuery < IAmounts > (salesAmountByDateRangeQuery, { from: _from, to: _to })
    .then(sales => {
      if (sales.salesAmountByDateRange.length > 0) {
        that.vm.updateYesterdaySales(sales.salesAmountByDateRange);
      }
    });
  }

  getMaxYesterdaySalesEmployee() {
    const that = this;

    this._apolloService.networkQuery < IAmounts > (salesEmployeeByDateRangeQuery, { predefinedDateRange: 'yesterday' })
    .then(sales => {
      if (sales.salesEmployeeByDateRange.length > 0) {
        that.vm.updateYesterdaySalesEmployee(sales.salesEmployeeByDateRange);
      }
    });
  }

  getTrendsLastMonthSales() {
    const that = this;

    if (!that.vm.isFirtsDayOfMonth()) { return; }

    const _from = that.vm.getFirstDayLastMonthDate().toString();
    const _to = that.vm.getTodayDate().toString();

    this._apolloService.networkQuery < IAmounts > (salesAmountByDateRangeQuery, { from: _from, to: _to })
    .then(sales => {
      if (sales.salesAmountByDateRange.length > 0) {
        that.vm.updateLastMonthSales(sales.salesAmountByDateRange);

        this._apolloService.networkQuery < IAmounts > (monthAvgSalesQuery, { date: _to })
        .then(avgSales => {
          if (avgSales.monthAvgSales.length > 0) {
            that.vm.updateMonthAvgSales(avgSales.monthAvgSales);
          }
        });
      }
    });
  }

  getYesterdayExpenses() {
    const that = this;

    const _from = that.vm.getYesterdayDate();
    const _to = that.vm.getTodayDate();

    this._apolloService.networkQuery < IAmounts > (expensesAmountByDateRangeQuery, { from: _from, to: _to })
    .then(expenses => {
      if (expenses.expensesAmountByDateRange.length > 0) {
        that.vm.updateYesterdayExpenses(expenses.expensesAmountByDateRange);
      }
    });
  }

  getTrendsLastMonthExpenses() {
    const that = this;

    if (!that.vm.isFirtsDayOfMonth()) { return; }

    const _from = that.vm.getFirstDayLastMonthDate().toString();
    const _to = that.vm.getTodayDate().toString();

    this._apolloService.networkQuery < IAmounts > (expensesAmountByDateRangeQuery, { from: _from, to: _to })
    .then(expenses => {
      if (expenses.expensesAmountByDateRange.length > 0) {
        that.vm.updateLastMonthExpenses(expenses.expensesAmountByDateRange);

        this._apolloService.networkQuery < IAmounts > (monthAvgExpensesQuery, { date: _to })
        .then(avgExpenses => {
          if (avgExpenses.monthAvgExpenses.length > 0) {
            that.vm.updateMonthAvgExpenses(avgExpenses.monthAvgExpenses);
          }
        });
      }
    });
  }

  getUsersActivities() {
    const that = this;

    const _from = that.vm.getYesterdayDate();
    const _to = that.vm.getTodayDate();

    this._apolloService.networkQuery < IAmounts > (usersActivityByDateRangeQuery, { from: _from, to: _to })
    .then(activities => {
      if (activities.usersActivityByDateRange.length > 0) {
        that.vm.updateUsersActivity(activities.usersActivityByDateRange);
      }
    });
  }

  get user(): IUserInfo {
    return this._user;
  }

}

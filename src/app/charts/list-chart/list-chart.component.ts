import { CommonService } from '../../shared/services/common.service';
import { AutoUnsubscribe } from '../../data-source/shared/auto-unsubscribe';
import { ListChartViewModel } from './list-chart.viewmodel';
import { UserService } from '../../shared/services/user.service';
import { Observable } from 'rxjs/Observable';
import { ListChartService } from '../shared/services/list-chart.service';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { FormatterFactory } from '../../dashboards/shared/extentions/chart-formatter.extention';
import { IChart, ListChartsQueryResponse } from '../shared/models';
import { AddChartActivity } from '../../shared/authorization/activities/charts/add-chart.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { ViewChartActivity } from '../../shared/authorization/activities/charts/view-chart.activity';
import { Subscription } from 'rxjs/Subscription';
import { ScrollEvent } from 'ngx-scroll-event';
import { BrowserService } from '../../shared/services/browser.service';

const Highcharts = require('highcharts/js/highcharts');

const ListChartsQuery = require('graphql-tag/loader!../shared/graphql/list-charts.query.gql');

@Activity(ViewChartActivity)
@Component({
  selector: 'kpi-list-chart',
  templateUrl: './list-chart.component.pug',
  styleUrls: ['./list-chart.component.scss'],
  providers: [ListChartService, ListChartViewModel, AddChartActivity]
})
export class ListChartComponent implements OnInit, OnDestroy {

  charts: IChart[] = [];
  fg: FormGroup = new FormGroup({});

  inspectorOpen$: Observable<boolean>;
  showAddBtn: boolean;

  private _subscription: Subscription[] = [];
  private _resultsUpIndex: number;
  private _resultsDownIndex: number;
  private _pageSize = 9;
  private _visibleCharts: IChart[] = [];

  constructor(private _apollo: Apollo,
              private _router: Router,
              private _svc: ListChartService,
              private _userService: UserService,
              public vm: ListChartViewModel,
              public addChartActivity: AddChartActivity,
              private _browser: BrowserService) {
        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });
    }

  ngOnInit() {
    this._subscribeToListOfCharts();
    this.inspectorOpen$ = this._svc.inspectorOpen$;
    this.vm.addActivities([this.addChartActivity]);

    this._resultsUpIndex = 0;
    this._resultsDownIndex = this._pageSize;
  }

  ngOnDestroy() {
      CommonService.unsubscribe(this._subscription);
  }

  get visibleCharts() {
      return this._visibleCharts;
  }

  addChart() {
      this._router.navigateByUrl('/charts/new');
  }

  select(item: IChart) {
      this._svc.setActive(item);
  }

  newChartAccess(): boolean {
    return this._userService.hasPermission('Create', 'Chart');
  }

  handleScroll(event: ScrollEvent) {
      if (event.isReachingBottom && this._resultsDownIndex < this.charts.length) {
            const downIndex = this._resultsDownIndex + this._pageSize;
            this._resultsDownIndex = downIndex > this.charts.length ? this.charts.length : downIndex;

            this._filterVisibleCharts();
            // console.log(`New boundaries: ${this._resultsUpIndex} - ${this._resultsDownIndex}`);
        }
  }

  private _filterVisibleCharts() {
      this._visibleCharts = this.charts.slice(this._resultsUpIndex, this._resultsDownIndex);
  }
  

  private _subscribeToListOfCharts() {
    const that = this;
    this._subscription.push(this._apollo.watchQuery <ListChartsQueryResponse> ({
        query: ListChartsQuery,
        fetchPolicy: 'network-only'
    })
    .valueChanges.subscribe(response => {
        that.charts = response.data.listCharts.data;
        that._filterVisibleCharts();
    }));
  }

}

import { isString } from 'lodash';
import { map } from 'rxjs/operators';
import { CommonService } from '../../shared/services/common.service';
import { AutoUnsubscribe } from '../../data-source/shared/auto-unsubscribe';
import { ListChartViewModel } from './list-chart.viewmodel';
import { UserService } from '../../shared/services/user.service';
import { Observable } from 'rxjs/Observable';
import { ListChartService } from '../shared/services/list-chart.service';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { FormatterFactory } from '../../dashboards/shared/extentions/chart-formatter.extention';
import { IChart, ListChartsQueryResponse } from '../shared/models';
import { AddChartActivity } from '../../shared/authorization/activities/charts/add-chart.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { ViewChartActivity } from '../../shared/authorization/activities/charts/view-chart.activity';
import { Subscription } from 'rxjs/Subscription';
import { ScrollEvent } from 'ngx-scroll-event';
import { BrowserService } from '../../shared/services/browser.service';
import { IMap } from '../../maps/shared/models/map.models';
import { ILegendColorConfig } from '../../maps/show-map/show-map.component';
import { LegendService } from '../../maps/shared/legend.service';
import { objectWithoutProperties } from '../../shared/helpers/object.helpers';

const Highcharts = require('highcharts/js/highcharts');

const ListChartsQuery = require('graphql-tag/loader!../shared/graphql/list-charts.query.gql');
const ListMapsQuery = require('graphql-tag/loader!../shared/graphql/list-maps.query.gql');

@Activity(ViewChartActivity)
@Component({
  selector: 'kpi-list-chart',
  templateUrl: './list-chart.component.pug',
  styleUrls: ['./list-chart.component.scss'],
  providers: [ListChartService, ListChartViewModel, AddChartActivity, LegendService]
})
export class ListChartComponent implements OnInit, OnDestroy, AfterViewInit {

  charts: IChart[] = [];
  maps: any[] = [];
  fg: FormGroup = new FormGroup({});

  selected$: Observable<any>;
  inspectorOpen$: Observable<boolean>;
  showAddBtn: boolean;
  legendColors: ILegendColorConfig[];

  private _subscription: Subscription[] = [];
  private _resultsUpIndex: number;
  private _resultsDownIndex: number;
  private _pageSize = 9;
  private _visibleCharts: IChart[] = [];
  private _visibleMaps: IMap[] = [];

  constructor(private _apollo: Apollo,
              private _router: Router,
              private _svc: ListChartService,
              private _userService: UserService,
              public vm: ListChartViewModel,
              public addChartActivity: AddChartActivity,
              private _legendService: LegendService,
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
    this._subscribeToListOfMaps();
    this.selected$ = this._svc.selected$;
    this.inspectorOpen$ = this._svc.inspectorOpen$;
    this.vm.addActivities([this.addChartActivity]);
    this._resultsUpIndex = 0;
    this._resultsDownIndex = this._pageSize;
  }

  ngAfterViewInit() {
    this.legendColors = this._legendService.getLegendColors();
    }

  ngOnDestroy() {
      CommonService.unsubscribe(this._subscription);
  }

    get visibleCharts() {
        return this._visibleCharts;
    }
    get visibleMaps() {
        return this._visibleMaps;
    }

    get visibleBigMaps() {
        return this._visibleMaps.filter(m => m.size === 'big');
    }

    get visibleSmallMaps() {
        return this._visibleMaps.filter(m => m.size === 'small');
    }

  addChart() {
      this._router.navigateByUrl('/charts/new');
  }

  select(item: IChart) {
      this._svc.setActive(item);
  }
  setActive() {
    // this._svc.setActive(this.item);
    this._svc.showInspector();
  }

  newChartAccess(): boolean {
    return this._userService.hasPermission('Create', 'Chart');
  }

  handleScroll(event: ScrollEvent) {
      if (event.isReachingBottom && this._resultsDownIndex < this.charts.length) {
            const downIndex = this._resultsDownIndex + this._pageSize;
            this._resultsDownIndex = downIndex > this.charts.length ? this.charts.length : downIndex;

            this._filterVisibleCharts();
            this._filterVisibleMaps();
            // console.log(`New boundaries: ${this._resultsUpIndex} - ${this._resultsDownIndex}`);
        }
  }

  private _filterVisibleCharts() {
      this._visibleCharts = this.charts.slice(this._resultsUpIndex, this._resultsDownIndex);
  }
  private _filterVisibleMaps() {
    this._visibleMaps = this.maps.slice(this._resultsUpIndex, this._resultsDownIndex);
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
  private _subscribeToListOfMaps() {
    const that = this;
    this._subscription.push(this._apollo.watchQuery <any> ({
        query: ListMapsQuery,
        fetchPolicy: 'network-only'
    })
    .valueChanges.subscribe(response => {
        if (response.data.listMaps) {
            that.maps = [];
            that.maps = response.data.listMaps.map(m => JSON.parse(m));
            that.maps.forEach(m => {
                m.markers = m.markers.map(mk => objectWithoutProperties(mk, ['__typename']));
            });
            that._filterVisibleMaps();
        }
    }));
  }

}

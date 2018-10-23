import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';

import { IChart, ListChartsQueryResponse } from '../../charts/shared/models/chart.models';
import { ModalComponent } from '../../ng-material-components';
import { CommonService } from '../../shared/services/common.service';
import { IChartSlideshow } from '../shared/model/chartslideshow.model';


const SlideshowById = require('graphql-tag/loader!../shared/graphql/chart-slideshow-by-id.query.gql');
const ListChartsQuery = require('graphql-tag/loader!../shared/graphql/list-charts.query.gql');
const SLIDESHOW_INTERVAL = 10000;

@Component({
    selector: 'kpi-show-chart-slideshow',
    templateUrl: './show-chart-slideshow.component.pug',
    styleUrls: ['./show-chart-slideshow.component.scss']
})
export class ShowChartSlideshowComponent implements OnInit, OnDestroy {
    @Input() slideshow: IChartSlideshow;
    @Output() stopPresentation = new EventEmitter();

    @ViewChild('slideshow') slideshowModal: ModalComponent;

    charts: IChart[] = [];
    allCharts: IChart[] = [];
    minHeight = 0;
    animation = 'fadeIn';

    private _slideshowTimer: any;
    private currentIndex = -1;
    private _subscription: Subscription[] = [];

    constructor(
        private _apollo: Apollo,
        private _router: Router,
        private _routeActive: ActivatedRoute,
    ) { }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
      this._calculateMinHeight();
    }

    ngOnInit() {
        this._getAllCharts();
        this._calculateMinHeight();
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    closeSlideshow() {
      const that = this;

      this.charts = null;
      this.animation = 'fadeOut';
      this._clearInterval();

      setTimeout(function() {
        that.stopPresentation.emit('');
        that.animation = 'fadeIn';
      }, 200);
    }

    private _calculateMinHeight() {
      this.minHeight = window.innerHeight * 0.9;
    }

    private _getAllCharts() {
        const that = this;

        this._subscription.push(this._apollo.query < ListChartsQueryResponse > ({
            query: ListChartsQuery
        }).subscribe(response => {
            that.allCharts = response.data.listCharts.data;
            if (that.allCharts) {
                that.charts = that.allCharts.filter(chart => this.slideshow.charts.includes(chart._id));
                that._startSlideshow();
            }
        }));
    }

    private _startSlideshow() {
        const that = this;

        if (!this.charts) {
            return;
        }

        that.currentIndex = 0;

        this._clearInterval();

        this._slideshowTimer = setInterval(function() {
            that.currentIndex = (that.currentIndex < that.charts.length - 1) ? that.currentIndex + 1 : 0;
        }, SLIDESHOW_INTERVAL);
    }

    private _clearInterval() {
        if (this._slideshowTimer) {
            clearInterval(this._slideshowTimer);
        }
    }
}

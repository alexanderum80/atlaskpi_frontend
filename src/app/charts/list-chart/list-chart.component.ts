import { IModalError } from './../../shared/interfaces/modal-error.interface';
import { IMutationResponse } from './../../shared/interfaces/mutation-response.interface';
import { IActionItemClickedArgs } from './../../shared/ui/lists/item-clicked-args';
import { CommonService } from '../../shared/services/common.service';
import { AutoUnsubscribe } from '../../data-source/shared/auto-unsubscribe';
import { ListChartViewModel } from './list-chart.viewmodel';
import { UserService } from '../../shared/services/user.service';
import { Observable } from 'rxjs/Observable';
import { ListChartService } from '../shared/services/list-chart.service';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { FormatterFactory } from '../../dashboards/shared/extentions/chart-formatter.extention';
import { IChart, ListChartsQueryResponse } from '../shared/models';
import { AddChartActivity } from '../../shared/authorization/activities/charts/add-chart.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { ViewChartActivity } from '../../shared/authorization/activities/charts/view-chart.activity';
import { Subscription } from 'rxjs/Subscription';
import { ScrollEvent } from 'ngx-scroll-event';
import { BrowserService } from '../../shared/services/browser.service';
import { ModalComponent } from 'src/app/ng-material-components';
import { DeleteChartMutation } from '../shared/graphql';

const Highcharts = require('highcharts/js/highcharts');

const ListChartsQuery = require('graphql-tag/loader!../shared/graphql/list-charts.query.gql');

interface IDeleteChartResponse {
    deleteChart: IMutationResponse;
}

@Activity(ViewChartActivity)
@Component({
  selector: 'kpi-list-chart',
  templateUrl: './list-chart.component.pug',
  styleUrls: ['./list-chart.component.scss'],
  providers: [ListChartService, ListChartViewModel, AddChartActivity]
})
export class ListChartComponent implements OnInit, OnDestroy {
    @ViewChild('errorModal') errorModal: ModalComponent;

    charts: IChart[] = [];
    fg: FormGroup = new FormGroup({});

    inspectorOpen$: Observable<boolean>;
    showAddBtn: boolean;

    private _subscription: Subscription[] = [];
    private _pageSize = 9;
    lastError: IModalError;

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
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
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

    private _subscribeToListOfCharts() {
        const that = this;
        this._subscription.push(this._apollo.watchQuery <ListChartsQueryResponse> ({
            query: ListChartsQuery,
            fetchPolicy: 'network-only'
        })
        .valueChanges.subscribe(response => {
            if (response && response.data.listCharts.data.length) {
                that.charts = response.data.listCharts.data;
                this.vm.setChartsList(this.charts);
            }
        }));
    }

    actionClicked(item: IActionItemClickedArgs) {
        switch (item.action.id) {
            case 'edit':
                this.edit(item.item.id);
                break;
            case 'delete':
                this.delete(item.item.id);
                break;
            case 'clone':
                this.clone(item.item.id);
                break;
        }
    }

    editClickedList($event) {
        if ($event.itemType === 'standard') {
            this.edit($event.item.id);
        }
        return;
    }

    edit(chartId) {
        this._router.navigate(['/charts/edit', chartId]);
     }

     clone(chartId) {
       this._router.navigate(['/charts/clone', chartId]);
     }

     delete(chartId) {
       const that = this;
       this._subscription.push(
         this._apollo.mutate<IDeleteChartResponse>({
             mutation: DeleteChartMutation,
             variables: { id: chartId },
             refetchQueries: ['ListChartsQuery']
         })
         .subscribe(response => {
            const { deleteChart } = response.data;
            const { success, errors } = deleteChart;

            if (!success && errors && errors.length) {
              const dependency = errors.find(e => e.field === '__isDependencyOf');
              that.lastError = {
                title: 'Error removing chart',
                msg: 'A chart cannot be remove while it\'s being used. The following element(s) are currently using this chart: ',
                items: dependency.errors
              };
              that.errorModal.open();
              return;
            }
         })
       );
     }

}

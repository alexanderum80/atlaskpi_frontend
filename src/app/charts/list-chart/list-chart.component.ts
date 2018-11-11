import { IItemListActivityName } from './../../shared/interfaces/item-list-activity-names.interface';
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
import { DeleteChartMutation } from '../shared/graphql';
import { RemoveConfirmationComponent } from '../../shared/ui/remove-confirmation/remove-confirmation.component';
import { ErrorComponent } from '../../shared/ui/error/error.component';
import { DialogResult } from '../../shared/models/dialog-result';
import { ModifyChartActivity } from 'src/app/shared/authorization/activities/charts/modify-chart.activity';
import { DeleteChartActivity } from 'src/app/shared/authorization/activities/charts/delete-chart.activity';
import { IUserInfo } from '../../shared/models';
import { ApolloService } from '../../shared/services/apollo.service';

const Highcharts = require('highcharts/js/highcharts');

const ListChartsQuery = require('graphql-tag/loader!../shared/graphql/list-charts.query.gql');
const updateUserInfo = require('graphql-tag/loader!../shared/graphql/current-user.gql');

interface IDeleteChartResponse {
    deleteChart: IMutationResponse;
}

@Activity(ViewChartActivity)
@Component({
  selector: 'kpi-list-chart',
  templateUrl: './list-chart.component.pug',
  styleUrls: ['./list-chart.component.scss'],
  providers: [ListChartService, ListChartViewModel, AddChartActivity, ModifyChartActivity, DeleteChartActivity]
})
export class ListChartComponent implements OnInit, OnDestroy {
    @ViewChild(RemoveConfirmationComponent) removeConfirmModal: RemoveConfirmationComponent;
    @ViewChild(ErrorComponent) errorModal: ErrorComponent;

    charts: IChart[] = [];
    fg: FormGroup = new FormGroup({});

    inspectorOpen$: Observable<boolean>;
    showAddBtn: boolean;

    private _subscription: Subscription[] = [];
    actionActivityNames: IItemListActivityName = {};

    lastError: IModalError;
    selectedChartId: string;
    itemType: string;
    user: IUserInfo;

    constructor(private _apollo: Apollo,
                private _apolloService: ApolloService,
                private _router: Router,
                private _svc: ListChartService,
                private _userService: UserService,
                public vm: ListChartViewModel,
                public addChartActivity: AddChartActivity,
                public modifyChartActivity: ModifyChartActivity,
                public deleteChartActivity: DeleteChartActivity,
                private _browser: BrowserService) {
            Highcharts.setOptions({
                lang: {
                    decimalPoint: '.',
                    thousandsSep: ','
                }
            });
            this.actionActivityNames = {
                edit: this.modifyChartActivity.name,
                delete: this.deleteChartActivity.name,
                visible: this.modifyChartActivity.name
            };
        }

    ngOnInit() {
        this._subscribeToListOfCharts();
        this.inspectorOpen$ = this._svc.inspectorOpen$;
        this.vm.addActivities([this.addChartActivity, this.modifyChartActivity, this.deleteChartActivity]);
        this._refresUserInfo();
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
        this.selectedChartId = chartId;
        this.removeConfirmModal.open();
    }

    onDialogResult(result: DialogResult) {
        switch (result) {
            case DialogResult.OK:
                this.confirmRemove();
                break;
            case DialogResult.CANCEL:
                this.removeConfirmModal.close();
                break;
        }
    }

    confirmRemove() {
        const that = this;
        this._subscription.push(
            this._apollo.mutate<IDeleteChartResponse>({
                mutation: DeleteChartMutation,
                variables: { id: this.selectedChartId },
                refetchQueries: ['ListChartsQuery']
            })
            .subscribe(response => {
                const { deleteChart } = response.data;
                const { success, errors } = deleteChart;

                this.removeConfirmModal.close();

                if (!success && errors && errors.length) {
                    const dependency = errors.find(e => e.field === '__isDependencyOf');
                    that.lastError = {
                        title: 'Error removing chart',
                        msg: 'A chart cannot be remove while it\'s being used. ' +
                                'The following element(s) are currently using this chart: ',
                        items: dependency.errors
                    };
                    that.errorModal.open();
                    return;
                }
            })
        );
    }

    cancelRemove() {
        this.selectedChartId = undefined;
        this.removeConfirmModal.close();
    }

    private _refresUserInfo(refresh ?: boolean) {
        const that = this;
        this._apolloService.networkQuery < IUserInfo > (updateUserInfo).then(d => {
            this.itemType = d.User.preferences.charts.listMode === "standardView" ? 'standard' : 'table';
        });
    }

}

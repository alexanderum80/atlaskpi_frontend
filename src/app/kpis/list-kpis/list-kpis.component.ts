// Angular imports
import { CommonService } from '../../shared/services/common.service';
import { ModalComponent } from '../../ng-material-components';
import { IModalError } from '../../shared/interfaces/modal-error.interface';
import { IItemListActivityName } from '../../shared/interfaces/item-list-activity-names.interface';
import { UpdateKpiActivity } from '../../shared/authorization/activities/kpis/update-kpi.activity';
import { CloneKpiActivity } from '../../shared/authorization/activities/kpis/clone-kpi.activity';
import { AddKpiActivity } from '../../shared/authorization/activities/kpis/add-kpi.activity';
import { ViewKpiActivity } from '../../shared/authorization/activities/kpis/view-kpi.activity';
import { DeleteKpiActivity } from '../../shared/authorization/activities/kpis/delete-kpi.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import SweetAlert from 'sweetalert2';
import { Subscription } from 'rxjs/Subscription';

import { ApolloService } from '../../shared/services/apollo.service';
import { ListKpisViewModel } from './list-kpis.viewmodel';
import { IKPI } from '../../shared/domain/kpis/kpi';
import { ISearchArgs } from '../../shared/ui/lists/item-list/item-list.component';
import { IActionItemClickedArgs } from '../../shared/ui/lists/item-clicked-args';
import { IListItem } from '../../shared/ui/lists/list-item';
import { UserService } from '../../shared/services/user.service';
import { IUserInfo } from '../../shared/models';

// External Libraries
// App Code
// Apollo Query/Mutations

const kpisQuery = require('graphql-tag/loader!./kpis.gql');
const deleteKpiMutation = require('graphql-tag/loader!./delete-kpi.gql');
const updateUserInfo = require('graphql-tag/loader!./current-user.gql');

@Activity(ViewKpiActivity)
@Component({
    selector: 'kpi-list-kpis',
    templateUrl: './list-kpis.component.pug',
    providers: [ListKpisViewModel, AddKpiActivity, UpdateKpiActivity, DeleteKpiActivity, CloneKpiActivity]
})
export class ListKpisComponent implements OnInit, OnDestroy {
    @ViewChild('errorModal') errorModal: ModalComponent;

    actionActivityNames: IItemListActivityName = {};
    lastError: IModalError;

    private _subscription: Subscription[] = [];
    itemType: string;
    user: IUserInfo;

    constructor(
        private _apolloService: ApolloService,
        private _router: Router,
        private _route: ActivatedRoute,
        public vm: ListKpisViewModel,
        public addKpiActivity: AddKpiActivity,
        public updateKpiActivity: UpdateKpiActivity,
        public cloneKpiActivity: CloneKpiActivity,
        private _userService: UserService,




        public deleteKpiActivity: DeleteKpiActivity) {
            const that = this;
            this._subscription.push(
            this._userService.user$
            .distinctUntilChanged()
            .subscribe((user: IUserInfo) => {
                that.user = user;
            }));

            this.actionActivityNames = {
                edit: this.updateKpiActivity.name,
                delete: this.deleteKpiActivity.name,
                clone:  this.cloneKpiActivity.name
            };
        }

    ngOnInit() {
        const that = this;

        if (!this.vm.initialized) {
            this.vm.initialize(null);
            this.vm.addActivities([this.addKpiActivity, this.updateKpiActivity, this.deleteKpiActivity, this.cloneKpiActivity]);
            this._refresUserInfo();
            this._refreshKpis();

        }
        
        this.itemType = this.user.preferences.charts.listMode === "standardView" ? 'standard' : 'table';

        this._subscription.push(this._route.queryParams.subscribe(p => {
            if (p.refresh) {
                that._refreshKpis();
            }
        }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    add() {
        this._router.navigate(['kpis', 'add']);
    }

    itemClicked(item: IListItem) {
        this.edit(item.id);
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

    private edit(id) {
        this._router.navigate(['kpis', 'edit', id]);
    }

    private clone(id) {
        this._router.navigate(['kpis', 'clone', id]);
    }


    private delete(id) {
        const that = this;

        SweetAlert({
                title: 'Are you sure?',
                text: 'Once deleted, you will not be able to recover this kpi',
                type: 'warning',
                showConfirmButton: true,
                showCancelButton: true
            })
            .then((res) => {
                if (res.value === true) {
                    that._apolloService.mutation < {
                            deleteKpi: {
                                success: boolean
                            }
                        } > (deleteKpiMutation, {
                            id: id
                        })
                        .then(result => {
                            const response = result.data.removeKPI;

                            if (response.success) {
                                that._refreshKpis();
                                return;
                            }

                            if (!response.success &&
                                 response.errors &&
                                 response.errors.length) {
                                    const chartErrorListNames = response.entity.chart.map(chartResp => 'Chart: ' + chartResp.title);
                                    const widgetErrorListNames = response.entity.widget.map(widgetResp => 'Widget: ' + widgetResp.name);
                                    const complexKpiListNames = response.entity.complexKPI.map(kpiResp => 'Complex Kpi: ' + kpiResp.name);

                                    const listNames = [].concat(chartErrorListNames, widgetErrorListNames, complexKpiListNames);

                                    that.lastError = {
                                        title: 'Error removing KPI',
                                        msg: 'A kpi cannot be remove while it\'s being used. ' +
                                                'The following element(s) are currently using this kpi: ',
                                        items: listNames
                                    };
                                    that.errorModal.open();
                            }
                        });
                }
            });
    }

    private _refresUserInfo(refresh ?: boolean) {
        const that = this;
        this._apolloService.networkQuery < IUserInfo > (updateUserInfo).then(d => {
            this.itemType = d.User.preferences.kpis.listMode === "standardView" ? 'standard' : 'table';
        });
    }

    private _refreshKpis(refresh ?: boolean) {
        const that = this;

        this._apolloService.networkQuery < IKPI[] > (kpisQuery).then(d => {
            that.vm.kpis = d.kpis;
        });
    }
}

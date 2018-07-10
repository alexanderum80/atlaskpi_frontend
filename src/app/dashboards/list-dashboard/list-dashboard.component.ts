import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import SweetAlert from 'sweetalert2';

import { AddDashboardActivity } from '../../shared/authorization/activities/dashboards/add-dashboard.activity';
import { DeleteDashboardActivity } from '../../shared/authorization/activities/dashboards/delete-dashboard.activity';
import { UpdateDashboardActivity } from '../../shared/authorization/activities/dashboards/update-dashboard.activity';
import { ViewDashboardActivity } from '../../shared/authorization/activities/dashboards/view-dashboard.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { IItemListActivityName } from '../../shared/interfaces/item-list-activity-names.interface';
import { ApolloService } from '../../shared/services/apollo.service';
import { IActionItemClickedArgs } from '../../shared/ui/lists/item-clicked-args';
import { IDashboard } from '../shared/models';
import { ListDashboardViewModel } from './list-dashboard.viewmodel';

const dashboardsQuery = require('../shared/graphql/all-dashboard.query.gql');
const dashboardQuery = require('../shared/graphql/dashboard.gql');
const deleteDashboardMutation = require('../shared/graphql/delete-dashboard.gql');
const updateVisibleDashboardMutation = require('../shared/graphql/updatevisible-dashboard.gql');

@Activity(ViewDashboardActivity)
@Component({
    selector: 'kpi-list-dashboard',
    templateUrl: './list-dashboard.component.pug',
    styleUrls: ['./list-dashboard.component.scss'],
    providers: [ListDashboardViewModel, AddDashboardActivity, UpdateDashboardActivity, DeleteDashboardActivity],
})
export class ListDashboardComponent implements OnInit {

    actionActivityNames: IItemListActivityName = {};
    xsSize = '75';

    constructor(
        private _route: ActivatedRoute,
        public vm: ListDashboardViewModel,
        public addDashboardActivity: AddDashboardActivity,
        private _apolloService: ApolloService,
        private _router: Router,
        public updateDashboardActivity: UpdateDashboardActivity,
        public deleteDashboardActivity: DeleteDashboardActivity) {
        this.actionActivityNames = {
            edit: this.updateDashboardActivity.name,
            delete: this.deleteDashboardActivity.name,
            visible: this.updateDashboardActivity.name
        };
    }

    ngOnInit() {
        const that = this;
        if (!this.vm.initialized) {
            this.vm.initialize(null);
            this.vm.addActivities([this.addDashboardActivity, this.updateDashboardActivity, this.deleteDashboardActivity]);
            this._refreshDashboards();
        }

        this._route.queryParams.subscribe(p => {
            if (p.refresh) {
                that._refreshDashboards();
            }
        });
    }

    actionClicked(item: IActionItemClickedArgs) {
        switch (item.action.id) {
            case 'edit':
                this.edit(item.item.id);
                break;
            case 'delete':
                this.delete(item.item.id);
                break;
            case 'visible':
            case 'notvisible':
                this.vm.updateActionItem(item.item);
                this.update(item);
                break;
        }
    }

    private update(item: IActionItemClickedArgs) {
        const that = this;
        const idDash = item.item.id;
        const visible = !item.item.visible;
        that._apolloService.mutation < {
                updatevisibleDashboard: {
                    success: boolean
                }
            } > (updateVisibleDashboardMutation, {
                id: item.item.id,
                input: !item.item.visible
            })
            .then(result => {
                const response = result;
                if (response.data.updatevisibleDashboard === true) {
                    this._refreshDashboards(true);
                }
            });
    }
    editClickedList($event) {
        if ($event.itemType === 'standard') {
            this.edit($event.item.id);
        }
        return;
    }

    edit(id) {
        this._router.navigateByUrl('/dashboards/edit/' + id);
    }

    delete(id) {
        const that = this;

        SweetAlert({
                title: 'Are you sure?',
                text: 'Once deleted, you will not be able to recover this dashboard',
                type: 'warning',
                showConfirmButton: true,
                showCancelButton: true
            })
            .then((res) => {
                if (res.value === true) {
                    that._apolloService.mutation < {
                            deleteDashboard: {
                                success: boolean
                            }
                        } > (deleteDashboardMutation, {
                            id: id
                        }, [
                            'Dashboards',
                            'allDashboard',
                            'idNameDashboardList'
                        ])
                        .then(result => {
                            const response = result.data.deleteDashboard;
                            if (response.success && that.vm.dashboards && that.vm.dashboards.length) {
                                that.vm.dashboards = that.vm.dashboards.filter(dashboard => dashboard._id !== response.entity._id);
                            }
                        });
                }
            });
    }

    add() {
        this._router.navigateByUrl('/dashboards/add');
    }

    private _refreshDashboards(refresh ? : boolean) {
        const that = this;
        this._apolloService.networkQuery < IDashboard[] > (dashboardsQuery).then(d => {
            that.vm.dashboards = d.dashboards;
        });
    }

}
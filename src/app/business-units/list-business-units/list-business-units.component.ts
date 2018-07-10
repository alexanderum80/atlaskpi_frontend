// Angular imports
import { CommonService } from '../../shared/services/common.service';
import { AutoUnsubscribe } from '../../data-source/shared/auto-unsubscribe';
import { ViewBusinessUnitActivity } from '../../shared/authorization/activities/business-units/view-business-unit.activity';
import { IItemListActivityName } from '../../shared/interfaces/item-list-activity-names.interface';
import {
    DeleteBusinessUnitActivity,
} from '../../shared/authorization/activities/business-units/delete-business-unit.activity';
import { AddBusinessUnitActivity } from '../../shared/authorization/activities/business-units/add-business-unit.activity';
import {
    UpdateBusinessUnitActivity
} from '../../shared/authorization/activities/business-units/update-business-unit.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import SweetAlert from 'sweetalert2';

import { ApolloService } from '../../shared/services/apollo.service';
import { IBusinessUnit } from '../shared/models/business-unit.model';
import { ListBusinessUnitsViewModel } from './list-business-units.viewmodel';
import { IActionItemClickedArgs } from '../../shared/ui/lists/item-clicked-args';
import { Subscription } from 'rxjs/Subscription';

const businessUnitsQuery = require('graphql-tag/loader!./business-units.gql');
const deleteBusinessUnitMutation = require('graphql-tag/loader!./delete-business-unit.gql');

@Activity(ViewBusinessUnitActivity)
@Component({
    selector: 'kpi-list-business-units',
    templateUrl: './list-business-units.component.pug',
    providers: [
        ListBusinessUnitsViewModel, AddBusinessUnitActivity,
        UpdateBusinessUnitActivity, DeleteBusinessUnitActivity
    ]
})
export class ListBusinessUnitsComponent implements OnInit, OnDestroy {

    actionActivityNames: IItemListActivityName = {};
    private _subscription: Subscription[] = [];

    constructor(
        private _apolloService: ApolloService,
        private _router: Router,
        private _route: ActivatedRoute,
        public vm: ListBusinessUnitsViewModel,
        public addBusinessUnitActivity: AddBusinessUnitActivity,
        public updateBusinessUnitActivity: UpdateBusinessUnitActivity,
        public deleteBusinessUnitActivity: DeleteBusinessUnitActivity) {
            this.actionActivityNames = {
                edit: this.updateBusinessUnitActivity.name,
                delete: this.deleteBusinessUnitActivity.name
            };
        }

    ngOnInit() {
        const that = this;

        if (!this.vm.initialized) {
            this.vm.initialize(null);
            this.vm.addActivities([this.addBusinessUnitActivity, this.updateBusinessUnitActivity, this.deleteBusinessUnitActivity]);
            this._refreshBusinessUnits();
        }

        this._subscription.push(this._route.queryParams.subscribe(p => {
            if (p.refresh) {
                that._refreshBusinessUnits();
            }
        }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    actionClicked(args: IActionItemClickedArgs) {
        switch (args.action.id) {
            case 'edit':
                this._edit(args.item.id);
                break;
            case 'delete':
                this._delete(args.item.id, args.item.title);
                break;
        }
    }

    add() {
        this._router.navigate(['business-units', 'add']);
    }

    editClickedList($event) {
        if ($event.itemType === 'standard') {
            this._edit($event.item.id);
        }
        return;
    }

    private _edit(id: string) {
        this._router.navigate(['business-units', 'edit', id]);
    }

    private _delete(id: string, name: string) {
        const that = this;

        SweetAlert({
                title: 'Are you sure?',
                text: `Once ${name}'s business unit has been deleted, you will not be able to recover it.
                        Are you sure you want to delete it?`,
                type: 'warning',
                showConfirmButton: true,
                showCancelButton: true
            })
            .then((res) => {
                if (res.value === true) {
                    that._apolloService.mutation < {
                            deleteBusinessUnit: {
                                success: boolean
                            }
                        } > (deleteBusinessUnitMutation, {
                            id: id
                        })
                        .then(result => {
                            if (result.data.deleteBusinessUnit.success) {
                                that._refreshBusinessUnits();
                            }
                        });
                }
            });
    }

    private _refreshBusinessUnits(refresh ?: boolean) {
        const that = this;

        this._apolloService.networkQuery < IBusinessUnit[] > (businessUnitsQuery).then(d => {
            that.vm.businessUnits = d.businessUnits;
        });
    }
}

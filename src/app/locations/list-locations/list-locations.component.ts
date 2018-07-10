// Angular imports
import { CommonService } from '../../shared/services/common.service';
import { ViewLocationActivity } from '../../shared/authorization/activities/locations/view-location.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { IItemListActivityName } from '../../shared/interfaces/item-list-activity-names.interface';
import { AddLocationActivity } from '../../shared/authorization/activities/locations/add-location.activity';
import { UpdateLocationActivity } from '../../shared/authorization/activities/locations/update-location.activity';
import { DeleteLocationActivity } from '../../shared/authorization/activities/locations/delete-location.activity';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    Router,
    ActivatedRoute
} from '@angular/router';

// External Libraries
import SweetAlert from 'sweetalert2';
// App Code
import { ApolloService } from '../../shared/services/apollo.service';
import { ILocation } from '../shared/models/location.model';
import { ListLocationsViewModel } from './list-locations.viewmodel';
import { IActionItemClickedArgs } from '../../shared/ui/lists/item-clicked-args';
import {
    Subscription
} from 'rxjs/Subscription';

// Apollo Query/Mutations

const locationsQuery = require('./locations.gql');
const deleteLocationMutation = require('./delete-location.gql');

@Activity(ViewLocationActivity)
@Component({
    selector: 'kpi-list-locations',
    templateUrl: './list-locations.component.pug',
    providers: [ListLocationsViewModel, AddLocationActivity, UpdateLocationActivity, DeleteLocationActivity]
})
export class ListLocationsComponent implements OnInit, OnDestroy {

    actionActivityNames: IItemListActivityName = {};
    private _subscription: Subscription[] = [];

    constructor(
        private _apolloService: ApolloService,
        private _router: Router,
        private _route: ActivatedRoute,
        public vm: ListLocationsViewModel,
        public addLocationActivity: AddLocationActivity,
        public updateLocationActivity: UpdateLocationActivity,
        public deleteLocationActivity: DeleteLocationActivity) {
            this.actionActivityNames = {
                edit: this.updateLocationActivity.name,
                delete: this.deleteLocationActivity.name
            };
        }

    ngOnInit() {
        const that = this;

        if (!this.vm.initialized) {
            this.vm.initialize(null);
            this.vm.addActivities([this.addLocationActivity, this.updateLocationActivity, this.deleteLocationActivity]);
            this._refreshLocations();
        }

        this._subscription.push(this._route.queryParams.subscribe(p => {
            if (p.refresh) {
                that._refreshLocations();
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
        this._router.navigate(['locations', 'add']);
    }

    editClickedList($event) {
        if ($event.itemType === 'standard') {
            this._edit($event.item.id);
        }
        return;
    }

    private _edit(id: string) {
        this._router.navigate(['locations', 'edit', id]);
    }

    private _delete(id: string, name: string) {
        const that = this;

        SweetAlert({
                title: 'Are you sure?',
                text: `Once ${name}'s location has been deleted, you will not be able to recover it. Are you sure you want to delete it?`,
                type: 'warning',
                showConfirmButton: true,
                showCancelButton: true
            })
            .then((res) => {
                if (res.value === true) {
                    that._apolloService.mutation < {
                            deleteLocation: {
                                success: boolean
                            }
                    } > (deleteLocationMutation, {id: id})
                    .then(result => {
                            if (result.data.deleteLocation.success) {
                                that._refreshLocations();
                            }
                    });
                }
            });
    }

    private _refreshLocations(refresh ?: boolean) {
        const that = this;

        this._apolloService.networkQuery < ILocation[] > (locationsQuery).then(d => {
            that.vm.locations = d.locations;
        });
    }
}

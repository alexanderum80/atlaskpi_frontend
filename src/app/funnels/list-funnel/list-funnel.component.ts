import { Component, OnInit, OnDestroy } from '@angular/core';
import { ListFunnelViewModel } from './list-funnel.viewmodel';
import { IFunnel } from '../shared/models/funnel.model';
import { ViewFunnelActivity } from '../../shared/authorization/activities/funnel/view-funnel.activity';
import { IItemListActivityName } from '../../shared/interfaces/item-list-activity-names.interface';
import { Subscription } from 'rxjs/Subscription';
import { AddFunnelActivity } from '../../shared/authorization/activities/funnel/add-funnel.activity';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { UpdateFunnelActivity } from '../../shared/authorization/activities/funnel/update-funnel.activity';
import { DeleteFunnelActivity } from '../../shared/authorization/activities/funnel/delete-funnel.activity';
import SweetAlert from 'sweetalert2';
import { ApolloService } from '../../shared/services/apollo.service';
import { IActionItemClickedArgs } from '../../shared/ui/lists/item-clicked-args';

const funnelListMock: IFunnel[] =
// [];
[
    { _id: '1', name: 'Sales Funnel', stages: [] },
    { _id: '2', name: 'Inquires Funnel', stages: [] },
];

const listFunnelQuery = require('graphql-tag/loader!./list-funnels.query.gql');
const removeFunnelMutation = require('graphql-tag/loader!./remove-funnel.mutation.gql');

@Component({
    selector: 'kpi-list-funnel',
    templateUrl: './list-funnel.component.pug',
    styleUrls: ['./list-funnel.component.scss'],
    providers: [ListFunnelViewModel, AddFunnelActivity, ViewFunnelActivity, UpdateFunnelActivity, DeleteFunnelActivity]
})
export class ListFunnelComponent implements OnInit, OnDestroy {
    actionActivityNames: IItemListActivityName = {};
    private _subscription: Subscription[] = [];

    loading = false;
    listEmpty = false;

    subscriptions: Subscription[] = [];

    constructor(
        private _router: Router,
        public vm: ListFunnelViewModel,

        // Activities
        public addFunnelActivity: AddFunnelActivity,
        public viewFunnelActivity: ViewFunnelActivity,
        public updateFunnelActivity: UpdateFunnelActivity,
        public deleteFunnelActivity: DeleteFunnelActivity,

        private _apollo: Apollo,
        private _apolloService: ApolloService,

    ) {
        this.actionActivityNames = {
            edit: this.updateFunnelActivity.name,
            delete: this.deleteFunnelActivity.name,
        };
    }

    ngOnInit() {
        if (!this.vm.initialized) {
            this.vm.initialize(null);
            this.vm.addActivities([
              this.viewFunnelActivity,
              this.addFunnelActivity,
              this.updateFunnelActivity,
              this.deleteFunnelActivity
            ]);
        }

        this.subscriptions.push(
            this._apollo.query<{ funnels: IFunnel[] }>({
                query: listFunnelQuery,
                fetchPolicy: 'network-only'
            })
            .subscribe(res => {
                this.vm.funnels = res.data.funnels;
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    nothing() {
      return;
    }

    add() {
        this._router.navigateByUrl('/funnels/new');
    }

    editClickedList($event) {
        if ($event.itemType === 'standard') {
            this.edit($event.item.id);
        }
        return;
    }

    actionClicked(item: IActionItemClickedArgs) {
        switch (item.action.id) {
            case 'edit':
                this.edit(item.item.id);
                break;
            case 'delete':
                this.delete(item.item.id);
                break;
            // case 'clone':
            //     this.clone(item.item.id);
            //     break;
        }
    }

    private edit(id) {
        this._router.navigate(['funnels', 'edit', id]);
    }

    private async delete(id) {
        const confirmed = await this.confirmRemoval();

        if (!confirmed) { return; }

        const res = await this._apollo.mutate({
            mutation: removeFunnelMutation,
            variables: { id }
        })
        .toPromise();

        this._refreshFunnelList();
    }

    private async confirmRemoval(): Promise<boolean> {
        const res = await SweetAlert({
            title: 'Are you sure?',
            text: `Once deleted, you will not be able to recover this funnel. Do you want to continue?`,
            type: 'warning',
            showConfirmButton: true,
            showCancelButton: true
        });

        return res.value;
    }

    private _refreshFunnelList() {
        this._apolloService.networkQuery < IFunnel[] > (listFunnelQuery).then(res => {
            this.vm.funnels = res.funnels;
        });
    }


}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ListFunnelViewModel } from './list-funnel.viewmodel';
import { IFunnel } from '../shared/models/funnel.model';
import { ViewFunnelActivity } from '../../shared/authorization/activities/funnel/view-funnel.activity';
import { IItemListActivityName } from '../../shared/interfaces/item-list-activity-names.interface';
import { Subscription } from 'rxjs/Subscription';
import { AddFunnelActivity } from '../../shared/authorization/activities/funnel/add-funnel.activity';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';


const funnelListMock: IFunnel[] =
// [];
[
    { _id: '1', name: 'Sales Funnel', stages: [] },
    { _id: '2', name: 'Inquires Funnel', stages: [] },
];

const listFunnelQuery = require('graphql-tag/loader!../shared/graphql/list-funnels.query.gql');

@Component({
    selector: 'kpi-list-funnel',
    templateUrl: './list-funnel.component.pug',
    styleUrls: ['./list-funnel.component.scss'],
    providers: [ListFunnelViewModel, AddFunnelActivity, ViewFunnelActivity]
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
        private _apollo: Apollo,

    ) {
        this.actionActivityNames = {
            edit: null,
            delete: null,
        };
    }

    ngOnInit() {
        if (!this.vm.initialized) {
            this.vm.initialize(null);
            this.vm.addActivities([
              this.viewFunnelActivity,
              this.addFunnelActivity
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


}

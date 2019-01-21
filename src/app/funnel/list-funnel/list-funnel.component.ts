import { Component, OnInit } from '@angular/core';
import { ListFunnelViewModel } from './list-funnel.viewmodel';
import { IFunnel } from '../shared/models/funnel.model';
import { ViewFunnelActivity } from '../../shared/authorization/activities/funnel/view-funnel.activity';
import { IItemListActivityName } from '../../shared/interfaces/item-list-activity-names.interface';
import { Subscription } from 'rxjs/Subscription';
import { AddFunnelActivity } from '../../shared/authorization/activities/funnel/add-funnel.activity';

const funnelListMock: IFunnel[] =
// [];
[
    { _id: '1', name: 'Sales Funnel', description: 'This is the sales funnel' },
    { _id: '2', name: 'Inquires Funnel', description: 'This is the inquires funnel' },
];

@Component({
    selector: 'kpi-list-funnel',
    templateUrl: './list-funnel.component.pug',
    styleUrls: ['./list-funnel.component.scss'],
    providers: [ListFunnelViewModel, AddFunnelActivity, ViewFunnelActivity]
})
export class ListFunnelComponent implements OnInit {
    actionActivityNames: IItemListActivityName = {};
    private _subscription: Subscription[] = [];

    loading = false;
    listEmpty = false;

    constructor(
        public vm: ListFunnelViewModel,

        // Activities
        public addFunnelActivity: AddFunnelActivity,
        public viewFunnelActivity: ViewFunnelActivity,
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

            this.vm.funnels = funnelListMock;
        }
    }

    nothing() {
      return;
    }
}

import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { UpdateKpiActivity } from '../../shared/authorization/activities/kpis/update-kpi.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { IKPI } from '../../shared/domain/kpis/kpi';
import { ApolloService } from '../../shared/services/apollo.service';
import { CommonService } from '../../shared/services/common.service';
import { CloneKpiViewModel } from './clone-kpi.component.viewmodel';

const kpiQuery = require('graphql-tag/loader!./kpi.gql');
const editMutation = require('graphql-tag/loader!./edit-kpi.gql');


@Activity(UpdateKpiActivity)
@Component({
    selector: 'kpi-clone-kpi',
    templateUrl: './clone-kpi.component.pug',
    encapsulation: ViewEncapsulation.None,
    providers: [
        CloneKpiViewModel
    ]
})
export class CloneKpiComponent implements OnInit, OnDestroy {
    private _subscription: Subscription[] = [];

    constructor(
        public vm: CloneKpiViewModel,
        private _route: ActivatedRoute,
        private _router: Router,
        private _apolloService: ApolloService) {}

    ngOnInit() {
        const that = this;

        this._subscription.push(this._route.params.subscribe(params => {
            that._getKpiInfo(params['id']).then(kpi => {
                that.vm.updateKpi(kpi);
            });

        }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    cancel(): void {
        this._router.navigateByUrl('kpis');
    }

    private _getKpiInfo(id: string): Promise < IKPI > {
        return this._apolloService.networkQuery < IKPI > (kpiQuery, {
                id: id
            })
            .then(res => res.kpi);
    }

    private _displayServerErrors(err) {
        console.log('Server errors: ' + JSON.stringify(err));
    }
}

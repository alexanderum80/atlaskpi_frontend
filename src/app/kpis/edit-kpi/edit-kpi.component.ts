import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { UpdateKpiActivity } from '../../shared/authorization/activities/kpis/update-kpi.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { IKPI, KPITypeEnum } from '../../shared/domain/kpis/kpi';
import { ApolloService } from '../../shared/services/apollo.service';
import { CommonService } from '../../shared/services/common.service';
import { ComplexKpiFormComponent } from '../kpi-form/complex/complex-kpi-form.component';
import { SimpleKpiFormComponent } from '../kpi-form/simple/simple-kpi-form.component';
import { ExternalSourceKpiFormComponent } from '../kpi-form/external-source/external-source-kpi-form.component';
import { EditKpiViewModel } from './edit-kpi.component.viewmodel';

const kpiQuery = require('graphql-tag/loader!./kpi.gql');
const editMutation = require('graphql-tag/loader!./edit-kpi.gql');

@Activity(UpdateKpiActivity)
@Component({
    selector: 'kpi-edit-kpi',
    templateUrl: './edit-kpi.component.pug',
    encapsulation: ViewEncapsulation.None,
    providers: [
        EditKpiViewModel
    ]
})
export class EditKpiComponent implements OnInit, OnDestroy {
    @ViewChild('simpleForm') private _simpleForm: SimpleKpiFormComponent;
    @ViewChild('complexForm') private _complexForm: ComplexKpiFormComponent;
    @ViewChild('externalSourceForm') private _externalSourceForm: ExternalSourceKpiFormComponent;

    private _subscription: Subscription[] = [];

    constructor(
        public vm: EditKpiViewModel,
        private _route: ActivatedRoute,
        private _router: Router,
        private _apolloService: ApolloService) {}

    ngOnInit() {
        const that = this;

        this._subscription.push(this._route.params.subscribe(params => {
            that._getKpiInfo(params['id']).then(kpi => {
                that.vm.updateKpi(kpi);
                that.vm.updateSelectedType();
            });
        }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
        this.vm.selectedType = null;
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

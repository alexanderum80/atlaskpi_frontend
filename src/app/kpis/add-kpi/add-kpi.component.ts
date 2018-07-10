// Angular Imports
import { AddKpiActivity } from '../../shared/authorization/activities/kpis/add-kpi.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { Component, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { ApolloService } from '../../shared/services/apollo.service';
import { ComplexKpiFormComponent } from '../kpi-form/complex/complex-kpi-form.component';
import { SimpleKpiFormComponent } from '../kpi-form/simple/simple-kpi-form.component';
import { AddKpiViewModel } from './add-kpi.component.viewmodel';
import { IListItem } from '../../shared/ui/lists/list-item';
import { KPITypeEnum } from '../../shared/domain/kpis/kpi';

// App Code
// Apollo Mutation

const addMutation = require('./add-kpi.gql');

@Activity(AddKpiActivity)
@Component({
    selector: 'kpi-add-kpi',
    templateUrl: './add-kpi.component.pug',
    styleUrls: ['./add-kpi.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        AddKpiViewModel
    ]
})
export class AddKpiComponent implements OnDestroy {
    @ViewChild('simpleForm') private _simpleForm: SimpleKpiFormComponent;
    @ViewChild('complexForm') private _complexForm: ComplexKpiFormComponent;

    constructor(
        private _router: Router,
        private _apolloService: ApolloService,
        public vm: AddKpiViewModel) {}


    ngOnDestroy() {
        this.vm.selectedType = null;
    }

    itemClicked(item: IListItem): void {
        const itm: any = (item as any).item;
        this.vm.selectedType = itm.id as KPITypeEnum; // simple or complex
    }

    cancel(): void {
        this._router.navigateByUrl('kpis');
    }

    private _displayServerErrors(err) {
        console.log('Server errors: ' + JSON.stringify(err));
    }
}

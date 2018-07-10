import {
    Component,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {
    ApolloService
} from '../../shared/services/apollo.service';
import SweetAlert from 'sweetalert2';
import { Router } from '@angular/router';


const refreshMutation = require('graphql-tag/loader!./refresh-demo-data.gql');

@Component({
    selector: 'kpi-demo-options',
    templateUrl: './demo-options.component.pug',
    styleUrls: ['./demo-options.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoOptionsComponent {
    toggled = false;
    refreshigData = false;

    constructor(private _apolloService: ApolloService,
                private _route: Router) {

    }

    toggleOptions() {
        this.toggled = !this.toggled;
    }

    goReal() {
        this._route.navigateByUrl('self-boarding-winzard');
    }

    refreshData() {
        this.refreshigData = true;
        this._apolloService.mutation(refreshMutation).then(res => {
            this.refreshigData = false;
            SweetAlert({
                title: 'Done!',
                text: 'Your data has been refreshed. The app is going to reload now.',
                type: 'info'
            }).then(done => {
                window.location.reload();
            });
        });
    }
}
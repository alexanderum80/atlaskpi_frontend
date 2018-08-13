import { ApolloService } from '../../shared/services/apollo.service';
import { WidgetFormViewModel } from './widget-form.viewmodel';
import {
    FormGroup
} from '@angular/forms';
import {
    Component,
    OnInit
} from '@angular/core';
import { Apollo } from 'apollo-angular';
import { SelectionItem } from '../../ng-material-components';
import {
    IListChartResponse,
    IDateRangeResponse,
    IKpisResponse
} from './widgets-graphql.interfaces';

declare var require;
const listChartQuery = require('graphql-tag/loader!./list-widget-charts.query.gql');
const dateRangeQuery = require('graphql-tag/loader!./date-ranges.query.gql');
const listKpisQuery = require('graphql-tag/loader!./list-kpis.query.gql');


@Component({
    selector: 'kpi-widget-form',
    templateUrl: './widget-form.component.pug',
    styleUrls: ['./widget-form.component.scss'],
    providers: [WidgetFormViewModel]
})
export class WidgetFormComponent implements OnInit {

    constructor(public vm: WidgetFormViewModel,
                private _apollo: Apollo,
                private _apolloService: ApolloService) {
        const that = this;

        vm.initialize(null);
    }

    ngOnInit() {
        const that = this;

        this._apolloService
            .networkQuery<IListChartResponse>(listChartQuery).then(r => that.vm.setCharts(r.listCharts.data));
        this._apolloService
            .networkQuery<IDateRangeResponse>(dateRangeQuery).then(r => that.vm.setDateRanges(r.dateRanges));
        this._apolloService
            .networkQuery<IKpisResponse>(listKpisQuery).then(r => that.vm.setKpis(r.kpis));
    }
}

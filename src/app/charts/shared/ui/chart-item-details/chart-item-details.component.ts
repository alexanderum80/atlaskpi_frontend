import { AKPIDateFormatEnum } from '../../../../shared/models/date-range';
import { UserService } from '../../../../shared/services';
import { IChart } from '../../models/chart.models';
import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment-timezone';

@Component({
    selector: 'kpi-chart-item-details',
    templateUrl: './chart-item-details.component.pug',
    styleUrls: ['./chart-item-details.component.scss'],
})
export class ChartItemDetailsComponent implements OnInit {
    @Input()
    item: IChart;

    constructor(private _userService: UserService) {}

    ngOnInit() {}

    safe(value) {
        return value || '-';
    }

    momentify(date) {
        const dateStr = moment.utc(date).format(AKPIDateFormatEnum.US_DATE);
        return moment(dateStr).format(AKPIDateFormatEnum.US_DATE);
    }
}

import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { toArray } from 'lodash';

import { SelectionItem } from '../../../ng-material-components';
import { FrequencyEmployeeTable, FrequencyTable } from './../../models/frequency';

@Component({
    selector: 'kpi-kpi-frequency-picker',
    templateUrl: './kpi-frequency-picker.component.pug',
    styleUrls: ['./kpi-frequency-picker.component.scss']
})
export class KpiFrequencyPickerComponent implements OnInit {
    @Input() fg: FormGroup;
    @Input() icon = 'time-restore';
    @Input() frequencyType: 'chart' | 'employee' = 'employee';
    @Input() required = false;

    frequencyList: SelectionItem[] = [];

    ngOnInit() {
        const table = this.frequencyType === 'employee' ?
        FrequencyEmployeeTable : FrequencyTable;

        this.frequencyList = Object.keys(table).map(f => {
            return {
                id: f,
                title: f,
                selected: false,
                disabled: false
            };
        });
    }
}

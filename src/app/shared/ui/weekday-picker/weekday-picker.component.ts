import { WeekDays } from '../../enums';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, HostBinding } from '@angular/core';

import { SelectionItem } from '../../../ng-material-components';

@Component({
    selector: 'kpi-weekday-picker',
    templateUrl: 'weekday-picker.component.pug'
})
export class WeekDayPickerComponent implements OnInit {
    @Input() selectedWeekDayId: string | number;
    @Input() fg: FormGroup;

    @HostBinding('class.h-100')
    @HostBinding('class.w-100')
    takeAllSpace = true;

    weekDays: SelectionItem[] = [];

    constructor() { };

    ngOnInit() {
      setTimeout(() =>  {
          this._updateWeekDaysList();
        }
      , 1000);
    }

    private _updateWeekDaysList() {
        const selectionList = Array<SelectionItem>();
        for (const d in WeekDays) {
            if (isNaN(Number(d))) {
                selectionList.push(new SelectionItem(WeekDays[d], d, String(WeekDays[d]) === String(this.selectedWeekDayId)));
            }
        }

        this.weekDays = selectionList;
    }
}

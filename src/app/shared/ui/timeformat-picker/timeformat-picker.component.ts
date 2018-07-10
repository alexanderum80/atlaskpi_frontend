import { TimeFormats } from '../../enums';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, HostBinding } from '@angular/core';

import { SelectionItem } from '../../../ng-material-components';

@Component({
    selector: 'kpi-timeformat-picker',
    templateUrl: './timeformat-picker.component.pug'
})
export class TimeFormatPickerComponent implements OnInit {
    @Input() selectedTimeFormatId: string | number;
    @Input() fg: FormGroup;

    @HostBinding('class.h-100')
    @HostBinding('class.w-100')
    takeAllSpace = true;

    timeFormats: SelectionItem[] = [];

    constructor() { };

    ngOnInit() {
      setTimeout(() =>  {
          this._updateTimeFormatList();
        }
      , 1000);
    }

    private _updateTimeFormatList() {
        const selectionList = Array<SelectionItem>();
        for (const t in TimeFormats) {
            if (isNaN(Number(t))) {
                selectionList.push(new SelectionItem(t, t, String(t) === String(this.selectedTimeFormatId)));
            }
        }
        this.timeFormats = selectionList;
    }
}

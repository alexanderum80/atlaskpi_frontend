import { Timezone } from '../../models';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { ToSelectionItemList } from '../../extentions';

import { SelectionItem } from '../../../ng-material-components';
@Component({
    selector: 'kpi-timezone-picker',
    templateUrl: 'timezone-picker.component.pug'
})
export class TimezonePickerComponent implements OnInit {
    @Input() selectedTimezoneId: string;
    @Input() fg: FormGroup;
    @Input() timezoneCollection: Timezone[] = [];

    @HostBinding('class.h-100')
    @HostBinding('class.w-100')
    takeAllSpace = true;

    timezones: SelectionItem[];

    ngOnInit() {
      setTimeout(() =>  {
          this._updateTimezoneList();
        }
      , 1000);
    }

    private _updateTimezoneList() {
      if (!this.timezoneCollection.length) { return; }

      this.timezones = ToSelectionItemList(this.timezoneCollection, 'text', 'text', this.selectedTimezoneId);
    }
}

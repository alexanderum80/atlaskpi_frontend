import { AKPIDateFormatEnum } from '../../models/date-range';
import { Component, Input, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { toArray } from 'lodash';
import { Subscription } from 'rxjs/Subscription';

import { SelectionItem } from '../../../ng-material-components';
import {
  IDatePickerConfig,
} from '../../../ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';
import { PredefinedDateRanges, IChartDateRange } from '../../models';
import * as moment from 'moment';

@Component({
    selector: 'kpi-kpi-daterange-picker',
    templateUrl: './kpi-daterange-picker.component.pug',
    styleUrls: ['./kpi-daterange-picker.component.scss']
})
export class KpiDaterangePickerComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() fg: FormGroup;
    @Input() icon = 'calendar';
    @Input() required = false;
    @Input() fromRequired = false;
    @Input() toRequired = false;
    @Input() dateRange: IChartDateRange;
    @Input() config: IDatePickerConfig;

    private _fromSubscription: Subscription;
    private _toSubscription: Subscription;

    datePickerConfig: IDatePickerConfig;

    dateRangeList: SelectionItem[] = [{
        id: 'custom',
        title: 'custom',
        selected: false,
        disabled: false
    }];

    constructor() {
        toArray(PredefinedDateRanges)
            .forEach(d => {
                this.dateRangeList.push({
                    id: d,
                    title: d,
                    selected: false,
                    disabled: false
                });
            });
    }

    ngOnInit() {
        this.datePickerConfig =
            this.config ||
            {
                showGoToCurrent: false,
                format: AKPIDateFormatEnum.US_DATE
            };
    }

    ngAfterViewInit() {
      const that = this;

      this.fg.get('predefinedDateRange').valueChanges.subscribe(value => {
        if (value === 'custom') {
          that._addFromToValidation();
        } else {
          that._removeFromToValidation();
        }
      });
    }

    ngOnDestroy() {
        this.fg.removeControl('from');
        this.fg.removeControl('to');

        if (this._fromSubscription) {
            this._fromSubscription.unsubscribe();
            this._toSubscription.unsubscribe();
        }
    }

    get showCustomDateRangeControls(): boolean {
        return this.fg.value['predefinedDateRange'] === 'custom';
    }

    private _addFromToValidation() {
        const that = this;

        setTimeout(() => {
            this._fromSubscription = this.fg.get('from').valueChanges.subscribe(from => {
                const to = that.fg.get('to');
                if (to && moment(from).isAfter(moment(to.value))) {
                    to.setValue(null);
                }
            });

            this._toSubscription = this.fg.get('to').valueChanges.subscribe(to => {
            const from = that.fg.get('from');
            if (from && moment(to).isBefore(moment(from.value))) {
                from.setValue(null);
            }
            });

            that._setValueToForm();

        }, 100);
    }

    private _removeFromToValidation() {
        if (this._fromSubscription) {
            this._fromSubscription.unsubscribe();
        }

        if (this._toSubscription) {
            this._toSubscription.unsubscribe();
        }
    }

    private _setValueToForm() {
        const from = moment.utc(this.dateRange[0].custom.from);
        const to = moment.utc(this.dateRange[0].custom.to);

        if (!from.isValid() || !to.isValid) { return; }

        this.fg.controls['from'].setValue(from.format(this.datePickerConfig.format));
        this.fg.controls['to'].setValue(to.format(this.datePickerConfig.format));
    }

}

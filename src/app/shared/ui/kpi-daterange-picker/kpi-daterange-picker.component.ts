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
import { DateService } from '../../services';
import { filter, map, tap, catchError } from 'rxjs/operators';
import { combineLatest, Observable, throwError } from 'rxjs';
import { ToSelectionItemList } from '../../extentions';

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

    private _lastValue;

    datePickerConfig: IDatePickerConfig;

    dateRangeList$: Observable<SelectionItem[]>;

    constructor(private dateService: DateService) {

        this.dateRangeList$ = this.dateService.dateRanges$
            .pipe(
                map(_ =>
                  ToSelectionItemList(
                    _.map(d => d.dateRange), 'predefined', 'predefined')
                )
            );
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
      this._setValueToForm();

    //   this.fg.get('predefinedDateRange').valueChanges.subscribe(value => {
    //     if (value === 'custom') {
    //       that._addFromToValidation();
    //     } else {
    //       that._removeFromToValidation();
    //     }
    //   });

        this.fg.valueChanges.subscribe(value => {
            if (!value.predefinedDateRange) { return; }
            if (JSON.stringify(value) === JSON.stringify(this._lastValue)) { return; }

            this._lastValue = value;

            if (value.predefinedDateRange === 'custom') {
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

            if (!this._fromSubscription) {
                this._fromSubscription = this.fg.get('from') && this.fg.get('from').valueChanges.subscribe(from => {
                    const to = that.fg.get('to');
                    if (to && moment(from).isAfter(moment(to.value))) {
                        to.setValue(null);
                    }
                });
            }

            if (!this._toSubscription) {
                this._toSubscription = this.fg.get('to') && this.fg.get('to').valueChanges.subscribe(to => {
                    const from = that.fg.get('from');
                    if (from && moment(to).isBefore(moment(from.value))) {
                        from.setValue(null);
                    }
                });
            }

            // that._setValueToForm();

        }, 100);
    }

    private _removeFromToValidation() {
        if (this._fromSubscription) {
            this._fromSubscription.unsubscribe();
            this._fromSubscription = null;
        }

        if (this._toSubscription) {
            this._toSubscription.unsubscribe();
            this._toSubscription = null;
        }
    }

    private _setValueToForm() {
        setTimeout(() => {
            const dateRange = (this.dateRange || [])[0] || this.dateRange;

            if (!dateRange || !dateRange.custom) { return; }
            const from = moment.utc(dateRange.custom.from);
            const to = moment.utc(dateRange.custom.to);
            if (!from.isValid() || !to.isValid) { return; }
            if (this.fg.controls.from && this.fg.controls.to) {
                this.fg.controls['from'].setValue(from.format(this.datePickerConfig.format));
                this.fg.controls['to'].setValue(to.format(this.datePickerConfig.format));
            }
        }, 100);
    }

}

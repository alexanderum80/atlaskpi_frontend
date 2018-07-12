import { ChartBasicInfoComponent } from '../../shared/ui/chart-basic-info';
import { SelectionItem } from '../../../ng-material-components/models';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ChartViewComponent, DateRange } from '..';
import { DialogResult } from '../../../shared/models/dialog-result';
import { ChartData } from '../chart-view.component';
import gql from 'graphql-tag';
import { ApolloService } from '../../../shared/services/apollo.service';

export const SettingsOnFlyKpisQuery = gql `
    query {
        settingOnFlyKpis {
            _id
            name
            groupingInfo {
                value
                name
            }
            type
        }
    }
`;


@Component({
    selector: 'kpi-change-settings-on-fly',
    templateUrl: './change-settings-on-fly.component.pug',
    styleUrls: ['./change-settings-on-fly.component.scss']
})
export class ChangeSettingsOnFlyComponent implements OnInit, AfterViewInit {
    @Input() chartData: ChartData;
    @Output() done = new EventEmitter < DialogResult > ();

    fg = new FormGroup({});
    groupingList: SelectionItem[] = [];
    dateRange: any;
    frequency: any;
    grouping: string[];
    // isChangedValue: boolean;
    chartType: string;

    constructor(private _chartViewComponent: ChartViewComponent,
                private _apolloService: ApolloService,
                private _cdr: ChangeDetectorRef) {}

    ngOnInit() {
        this._getGroupingList();
        this._getValueFromChart();
        this._subscribeToFormValueChanges();
        this.chartType = this.chartData.chartDefinition.chart.type;
    }

    ngAfterViewInit() {
        this._setValueToForm();
    }

    private _subscribeToFormValueChanges() {
        // this.fg.valueChanges.subscribe(() => {
        //     this.isChangedValue = this.changedValue() && this.fg.valid;
        // });
    }

    updateChart() {
        this._changeSettingsOnFly();
        this.done.emit(DialogResult.PREVIEW);
    }

    back() {
        this.done.emit(DialogResult.CANCEL);
    }

    private _getGroupingList() {

        const that = this;
        this._apolloService.networkQuery < SelectionItem > (SettingsOnFlyKpisQuery)
        .then(kpis => {
            const kpi = kpis.settingOnFlyKpis.find(k => k._id === this.chartData.kpis[0]._id);
            if (kpi) {
                this.groupingList = kpi.groupingInfo.map(g => new SelectionItem(g.value, g.name));
            }
        });
    }

    private _getValueFromChart() {
        this.dateRange = this.chartData.dateRange;
        this.frequency = this.chartType !== 'pie' ? this.chartData.frequency : null;
        this.grouping = this.chartData.groupings;
    }

    private _setValueToForm() {
        this.fg.controls['predefinedDateRange'].setValue(this.chartData.dateRange[0].predefined);
        if (this.chartType !== 'pie') {
            this.fg.controls['frequency'].setValue(this.chartData.frequency);
        }
        this.fg.controls['groupings'].setValue(this.chartData.groupings ? this.chartData.groupings[0] : null);
        this._cdr.detectChanges();
    }

    private _changeSettingsOnFly() {
        const value = this.fg.value;
        const dateRange: DateRange = {
            from: value.from,
            to: value.to
        };

        this._chartViewComponent.setSettingsOnFly(value.predefinedDateRange, dateRange, value.frequency, value.groupings);
    }

    /**
     * check if values(dateRange[0].predefined, frequency, grouping[0]) from chartData
     * is the same values in the formgroup(predefinedDateRange, frequency, grouping).
     * used to disable/enable 'set' button
     */
    // changedValue() {
    //     const hasDateRangeChanged: boolean = this._hasDateRangeChanged();

    //     const hasFrequencyValueChanged: boolean = this._hasFrequencyChanged();
    //     const changeFrequency = this.chartType !== 'pie' ? hasFrequencyValueChanged : false;

    //     const hasGroupingChanged: boolean = this._hasGroupingChanged();
    //     return hasDateRangeChanged || changeFrequency || hasGroupingChanged;
    // }

    private _hasGroupingChanged(): boolean {
        return this._getFormControlValue('grouping') !== this._getChartDataGrouping();
    }

    private _hasFrequencyChanged(): boolean {
        return this.frequency !== this._getFormControlValue('frequency');
    }

    private _hasDateRangeChanged(): boolean {
        return this.dateRange[0].predefined !== this._getFormControlValue('predefinedDateRange');
    }

    private _getChartDataGrouping() {
        return this.grouping ? this.grouping[0] : null;
    }


    private _getFormControlValue(controlName: string) {
        if (!controlName) {
            return null;
        }

        const control = this.fg.controls[controlName];
        if (!control) {
            return null;
        }

        return control.value;
    }
}

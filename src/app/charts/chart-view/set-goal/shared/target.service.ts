import 'rxjs/add/operator/debounceTime';

import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import * as moment from 'moment';
import { isBoolean, isObject, isEmpty, uniqBy, isString } from 'lodash';
import { SelectionItem } from '../../../../ng-material-components';
import { targetApi } from '../graphqlActions/set-goal-actions';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import {IChartDateRange, PredefinedDateRanges, IDateRange} from '../../../../shared/models/date-range';

export interface ITargetNotifyFields {
    users: string[];
    notification: string;
}

export interface IDataNotify {
    notifyUsers: string;
    notificationUsers: string;
}

export interface ITargetFormFields {
    name: string;
    datepicker: string;
    vary: string;
    amount: number|string;
    amountBy: string;
    active: boolean;
    type: string;
    period?: string;
    visible?: string[];
    notify?: ITargetNotifyFields;
    nonStackName?: string;
    stackName?: string;
    owner: string;
    chart: string[];
}

export interface IChartInfo {
    dateRange: IChartDateRange[];
    frequency: string;
}

@Injectable()
export class TargetService {

    valueTypes: SelectionItem[] = [{
        id: 'percent',
        title: '%',
        selected: false,
        disabled: false
    }, {
        id: 'dollar',
        title: '$',
        selected: false,
        disabled: false
    }];

    varyTypes: SelectionItem[] = [{
        id: 'fixed',
        title: 'Fixed',
        selected: false,
        disabled: false
    }, {
        id: 'increase',
        title: 'Increase',
        selected: false,
        disabled: false
    }, {
        id: 'decrease',
        title: 'Decrease',
        selected: false,
        disabled: false
    }];

    periodTypes: SelectionItem[] = [{
        id: 'yesterday',
        title: 'Yesterday',
        selected: false,
        disabled: false
    }, {
        id: 'last week',
        title: 'Last Week',
        selected: false,
        disabled: false
    }, {
        id: 'last month',
        title: 'Last Month',
        selected: false,
        disabled: false
    }, {
        id: 'last quarter',
        title: 'Last Quarter',
        selected: false,
        disabled: false
    }, {
        id: 'last year',
        title: 'Last Year',
        selected: false,
        disabled: false
    }];

    notificationDateList: SelectionItem[] = [{
        id: 'days',
        title: 'day(s)',
        selected: false,
        disabled: false
    }, {
        id: 'weeks',
        title: 'week(s)',
        selected: false,
        disabled: false
    }];

    milestoneList: SelectionItem[] = [
        { id: 'yes', title: 'Yes', selected: true, disabled: false },
        { id: 'no', title: 'No', selected: false, disabled: false }
    ];

    private _chartId = '';
    private _notificationInfo: any;
    private _chartInfo: IChartInfo;

    private _chartIdSubject: BehaviorSubject<string> = new BehaviorSubject<string>(this._chartId);
    private _notificationInfoSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private _chartInfoSubject: BehaviorSubject<IChartInfo> = new BehaviorSubject<IChartInfo>(this._chartInfo);

    private _subscription: Subscription[] = [];

    private existDuplicatedName: boolean;
    private _dueDate: string;

    constructor(private _apollo: Apollo) {
        this.chartInfo$.subscribe((item: IChartInfo) => this._processChartInfo(item));
    }

    get chartId$(): Observable<string> {
        return this._chartIdSubject.asObservable().distinctUntilChanged();
    }

    get notificationInfo$(): Observable<any> {
        return this._notificationInfoSubject.asObservable().distinctUntilChanged();
    }

    get chartInfo$(): Observable<IChartInfo> {
        return this._chartInfoSubject.asObservable().distinctUntilChanged();
    }

    get dueDate$(): string {
        return this._dueDate;
    }

    get subscriptions(): Subscription[] {
        return this._subscription;
    }

    setChartId(id: string): void {
        if (!id) { return; }
        this._chartId = id;
        this._chartIdSubject.next(this._chartId);
    }

    setNotificationInfo(data: any): void {
        if (!data) { return; }
        this._notificationInfo = data;
        this._notificationInfoSubject.next(this._notificationInfo);
    }

    setChartInfo(chartInfo: IChartInfo): void {
        if (isEmpty(chartInfo) || Object.keys(chartInfo).length !== 2) {
            return;
        }

        this._chartInfo = chartInfo;
        this._chartInfoSubject.next(this._chartInfo);
    }

    setDueDate(dueDate: string): void {
        if (!isString(dueDate)) {
            return;
        }

        const isDateValid = moment(dueDate, 'MM/DD/YYYY', true).isValid();
        if (!isDateValid) {
            return;
        }

        this._dueDate = dueDate;
    }

    updatePeriodTypes(extraPeriodObjects: any): void {
         if (!extraPeriodObjects || !isObject(extraPeriodObjects)) {
             return;
         }

         Object.keys(extraPeriodObjects).forEach(item => {
             const itemExists = this.periodTypes.find(types => types.id === item);
             if (!itemExists) {
                this.periodTypes.push({
                    id: extraPeriodObjects[item],
                    title: extraPeriodObjects[item],
                    selected: false,
                    disabled: false
                });
             }
         });

         this.periodTypes = uniqBy(this.periodTypes, 'id');
    }

    removeTargetFromEditChart(id) {
        this._subscription.push(
            this._apollo.mutate({
                mutation: targetApi.removeTargetFromChart,
                variables: {
                    id: id
                }
            }).subscribe((data) => {
                // console.log(data);
            })
        );
    }

    getNotify(data: IDataNotify): ITargetNotifyFields {
        if (!data || !data.notifyUsers) {
            return;
        }
        return {
            users: data.notifyUsers.split('|'),
            notification: data.notificationUsers
        };
    }

    getVisible(data: any) {
        if (!data || !data.visibleUsers) {
            return;
        }
        return data.visibleUsers.split('|');
    }

    setNotifyUser(fgNotify: FormGroup, selectedTarget: any, notifyStaff: any) {
        if (!selectedTarget.form.notify) {
            return;
        }
        const that = this;
        const fg = fgNotify.value;
        const form = selectedTarget.form;
        fgNotify.controls['notifyUsers'].setValue(form.notify.users.join('|'));
        fgNotify.controls['notificationUsers'].setValue(moment(form.notify.notification).format('MM/DD/YYYY'));
    }

    setVisibleUser(fgVisible: any, selectedTarget: any, visibleStaff: any) {
        if (!fgVisible || !selectedTarget || !visibleStaff) {
            return;
        }

        const that = this;
        const fg = fgVisible.value;
        const form = selectedTarget.form;

        fgVisible.controls['visibleUsers'].setValue(form.visible.join('|'));
    }

    removeCommaSelectPicker(users: any): any[] {
        if (!users) {
            return;
        }
        return users.filter(u => {
            return u.id.replace(/,/g, '');
        });
    }

    putBackCommaSelectPicker(usersStaff: any, stackName: string): string {
        let findStackName = '';
        for (let i = 0; i < usersStaff.length; i++) {
            if (usersStaff[i].id === stackName) {
                findStackName = usersStaff[i].title;
                break;
            }
        }
        return findStackName;
    }

    formFields(form: any, currentUser: string, chartId: string): ITargetFormFields {
        if (!form || !currentUser || !chartId) {
            return;
        }

        const period = (form.fg.vary === 'fixed') ? '' : form.fg.period;
        const amountBy = (form.fg.vary === 'fixed' && (form.fg.amountBy !== 'dollar')) ? 'dollar' : form.fg.amountBy;
        const fields: ITargetFormFields = {
            name: form.fg.name,
            datepicker: form.fg.datepicker,
            vary: form.fg.vary,
            amount: form.fg.amount,
            amountBy: amountBy,
            active: form.fg.active,
            type: 'spline',
            period: period,
            visible: this.getVisible(form.fgVisible),
            nonStackName: form.fg.nonStackName,
            stackName: form.fg.stackName,
            owner: currentUser,
            chart: [chartId]
        };

        const notification = this.getNotify(form.fgNotify);
        if (notification) {
            fields['notify'] = notification;
        }
        return fields;
    }

    // when chart has no frequency
    isTargetDueDateValid(targetDueDate: string): boolean {
        if (!isString(targetDueDate)) {
            return true;
        }

        if (!this.dueDate$) {
            return true;
        }

        return this.dueDate$ === targetDueDate;
    }

    isFormValid(fg: FormGroup, fgVisible: FormGroup, fgNotify?: FormGroup): boolean {
        return !isEmpty(fg.controls) &&
               fg.valid &&
               this.isTargetDueDateValid(fg.get('datepicker').value) &&
               fgVisible.get('visibleUsers').value &&
               moment(fg.value.datepicker).isAfter(moment().format('MM/DD/YYYY')) &&
               this.isNotifyDateValid(fg, fgNotify) &&
               (fg.get('stackName').value || fg.get('nonStackName').value);
    }

    isNotifyDateValid(fg: FormGroup, fgNotify: FormGroup): boolean {
        if (!fg.value.datepicker || !fgNotify) {
            return true;
        }

        if (fgNotify.value.notifyUsers && !fgNotify.value.notificationUsers) {
            return false;
        }

        if (fgNotify.value.notificationUsers && !fgNotify.value.notifyUsers) {
            return false;
        }

        const isDateBeforeNow: boolean = moment(fgNotify.value.notificationUsers).isBefore(moment().format('MM/DD/YYYY'));
        if (isDateBeforeNow) {
            return false;
        }

        const isDateAfterDueDate: boolean = moment(fgNotify.value.notificationUsers).isAfter(moment(fg.value.datepicker));
        if (isDateAfterDueDate) {
            return false;
        }

        return true;
    }

    /**
     * when goal is 'increase' or 'decrease', starting period is required
     * @param fg
     */
    isVaryPeriodValid(fg: FormGroup): void {
        if (!fg) { return; }

        fg.valueChanges.subscribe(values => {
            if (values) {
                if (values.vary) {
                    if ((values.vary !== 'fixed') && (!values.period)) {
                        fg.controls['period'].setErrors({ required: true });
                    } else {
                        fg.controls['period'].setErrors(null);
                    }
                }
            }
        });
    }

    updateExistDuplicatedName(value: boolean) {
        this.existDuplicatedName = value;
    }

    getExistDuplicatedName(): boolean {
        return this.existDuplicatedName;
    }

    private _processChartInfo(item: IChartInfo): void {
        if (!item || item.frequency || isEmpty(item.dateRange)) {
            return;
        }

        const predefinedDateRange: string = item.dateRange[0].predefined;
        const customDateRange: IDateRange = item.dateRange[0].custom;
        const momentFormat = 'MM/DD/YYYY';

        let dueDate: string;

        switch (predefinedDateRange) {
            case PredefinedDateRanges.thisYearToDate:
            case PredefinedDateRanges.thisQuarterToDate:
            case PredefinedDateRanges.thisMonthToDate:
            case PredefinedDateRanges.thisWeekToDate:
                dueDate = moment().endOf('day').format(momentFormat);
                break;
            case PredefinedDateRanges.thisYear:
                dueDate = moment().endOf('year').format(momentFormat);
                break;
            case PredefinedDateRanges.thisQuarter:
                dueDate = moment().quarter(moment().quarter()).endOf('quarter').format(momentFormat);
                break;
            case PredefinedDateRanges.thisMonth:
                dueDate = moment().endOf('month').format(momentFormat);
                break;
            case PredefinedDateRanges.thisWeek:
                dueDate = moment().endOf('week').format(momentFormat);
                break;
            case PredefinedDateRanges.allTimes:
                dueDate = moment().format(momentFormat);
                break;
            case 'custom':
                const to = customDateRange.to;
                dueDate = moment(to).format(momentFormat);
                break;
            default:
                dueDate = moment().format(momentFormat);
                break;

        }

        this.setDueDate(dueDate);
    }
}

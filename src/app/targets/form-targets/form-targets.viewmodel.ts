import { Injectable } from '@angular/core';
import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { Field, ArrayField } from '../../ng-material-components/viewModels';
import {
    ITargetNew, UsersNew, NotificationConfigNew, SourceNew, DateRangeNew, ReportOptionsNew, deliveryMethod
} from '../shared/models/targets.model';
import { SelectionItem } from '../../ng-material-components';
import { IListItem } from '../../shared/ui/lists/list-item';
import { IUserInfo, User } from '../../shared/models';
import { MenuItem } from '../../ng-material-components';
import * as moment from 'moment';


export class DateRangeViewModel extends ViewModel<DateRangeNew> {

    @Field({ type: String })
    from: string;

    @Field({ type: String })
    to: string;

    public initialize(model: DateRangeNew): void {
        this.onInit(model);
    }
}


export class ReportOptionsViewModel extends ViewModel<ReportOptionsNew> {

    @Field({ type: String })
    frequency:  string ;

    @Field({ type: String })
    groupings:  [string];

    @Field({ type: String, required: true  })
    timezone: { string };

    @Field({ type: DateRangeViewModel, required: true  })
    dateRange: DateRangeNew;

    @Field({ type: String })
    filter: string[];

    public initialize(model: ReportOptionsNew): void {
        this.onInit(model);
    }
}


export class SourceViewModel extends ViewModel<SourceNew> {

    @Field({ type: String })
    type: string;

    @Field({ type: String })
    identifier: string;

    public initialize(model: SourceNew): void {
        this.onInit(model);
    }
}


export class deliveryMethodViewModel extends ViewModel<deliveryMethod> {

    @Field({ type: Boolean })
    email: boolean;

    @Field({ type: Boolean })
    push: boolean;

    public initialize(model: deliveryMethod): void {
        this.onInit(model);
    }
}

export interface deliveryMethod {
    email: boolean;
    push: boolean;
}

export class UserViewModel extends ViewModel<UsersNew> {

    @Field({ type: String })
    id: string;

    @Field({ type: deliveryMethodViewModel })
    deliveryMethod: [deliveryMethod];

    public initialize(model: UsersNew): void {
        this.onInit(model);
    }
}

export class NotifyViewModel extends ViewModel<NotificationConfigNew> {

    @Field({ type: Number })
    notifiOnPercente: number;

    @Field({ type: UserViewModel })
    users: [UsersNew];

    public initialize(model: NotificationConfigNew): void {
        this.onInit(model);
    }
}


@Injectable()
export class FormTargetsViewModel extends ViewModel<ITargetNew> {
    protected _user: IUserInfo;

    private _targetsPeriodItemList: SelectionItem[];
    private _groupingsItemList: SelectionItem[];
    private frequency: any;
    private _groupings: any;
    private nodoSelectedTextGrouping: string;
    private nodoSelectedTextCompareTo: string;


    visbleGroupings = true;
    noFrequency = false;
    activeVisble = false;
    nodoSelectedText = '';
    target: any;
    existCustom;
    custom: boolean;

    constructor() {
        super(null);
    }

    titleAction = '';

    objectiveList: SelectionItem[] = [
        { id: 'increase', title: 'Increase' },
        { id: 'decrease', title: 'Decrease' },
        { id: 'fixed', title: 'Fixed' },
    ];

    periodList: SelectionItem[] = [];

    baseOnList: SelectionItem[] = [];

    userList: SelectionItem[] = [];

    responsiblePeopleList: SelectionItem[] = [];


    @Field({ type: String })
    _id: string;

    @Field({ type: String, required: true })
    name: string;

    @Field({ type: String,  required: true })
    kpi: string;

    @Field({ type: String,  required: true })
    type: string ;

    @Field({ type: String })
    filter:  string[] ;

    @Field({ type: String,  required: true  })
    compareTo: string;

    @Field({ type: String,  required: true  })
    period: string;

    @Field({ type: Boolean })
    recurrent: boolean;

    @Field({ type: Number,  required: true  })
    value: number;

    @Field({ type: String })
    unit: string;

    @Field({ type: String})
    notifiOnPercente: [number];

    @Field({ type: String  })
    owner: string;

    @Field({ type: Boolean })
    active: boolean;

    @Field({ type: Boolean })
    email: boolean;

    @Field({ type: Boolean })
    push: boolean;

    @Field({ type: Boolean })
    selected: boolean ;

    @ArrayField({type: UserViewModel })
    users: UsersNew[];

    @ArrayField({type: SourceViewModel})
    source: SourceNew;

    @ArrayField({type: ReportOptionsViewModel})
    reportOptions: ReportOptionsNew;

    @ArrayField({type: NotifyViewModel })
    notificationConfig: NotificationConfigNew;

    @Field({ type: String })
    groupings:  [string];

    initialize(model: any): void {
        this.onInit(model);
    }

    get addPayload() {
        const value = this.modelValue;
        return null;

    }

    get editPayload() {
        const value = this.addPayload as any;
        value.id = this._id;

        return value;
    }

    setTargetPeriod(frequency, predefined) {
        if (frequency === this.frequency) {
            return;
        }

        this.frequency = frequency;
        this._prepareTargentePeriodListItems(predefined);
    }

    setGroupings(list) {
        this.nodoSelectedTextGrouping !== '' ?
             this.grouping = this.nodoSelectedTextGrouping :
             this.grouping = 'all';

        if (list === this.groupings) {
            return;
        }

        this._groupings = list;
        this._groupings.push('all');
        this._groupingsItemList = this._groupings.map(d => ({
            id: d ,
            title: d,
        }));
    }

    get groupingsList(): SelectionItem[] {
        return this._groupingsItemList;
    }

    get targetPeriodItems(): SelectionItem[] {
        return this._targetsPeriodItemList;
    }

    set grouping(grouping) {
        this.nodoSelectedTextGrouping = grouping;
    }

    get grouping() {
        return this.nodoSelectedTextGrouping;
    }

    set peridos(period) {
        this.period = period;
    }

    get periods() {
        return this.period;
    }

    private _prepareTargentePeriodListItems(predefined) {
        // this._getFrequency(predefined);

        this._targetsPeriodItemList = this._getFrequency(predefined).map(d => ({
            id: d ,
            title: d,
        }));

        if (this._targetsPeriodItemList.length === 0) {
            this._targetsPeriodItemList = [{
                id: predefined ,
                title: predefined,
            }];
            this.period = predefined;
            this.nodoSelectedText = predefined;
        } else if (!this.period) {
            this.period = this._targetsPeriodItemList[0].title;
            this.nodoSelectedText = this._targetsPeriodItemList[0].title;
        }
    }

    baseOnLists(frequency) {
        this.period = this.nodoSelectedTextCompareTo;
        switch (frequency) {
            case 'monthly':
                    this.baseOnList = [{
                        id: 'last month',
                        title: 'last month'
                    }, {
                        id: 'same month, Last year',
                        title: 'same month Last year'
                    }, {
                        id: 'same month, 2 year ago',
                        title: 'same month 2 year ago'
                    }];
                break;
            case 'quarterly':
                    this.baseOnList = [{
                        id: 'last quarter',
                        title: 'last quarter'
                    }, {
                        id: 'same quarter, Last year',
                        title: 'same quarter Last year'
                    }, {
                        id: 'same quarter, 2 year ago',
                        title: 'same quarter 2 year ago'
                    }];
                break;
            case 'weekly':
                    this.baseOnList = [{
                        id: 'last week',
                        title: 'last week'
                    }, {
                        id: 'same week, Last year',
                        title: 'same week Last year'
                    }, {
                        id: 'same week, 2 year ago',
                        title: 'same week 2 year ago'
                    }];
                break;
            case 'yearly':
                    this.baseOnList = [{
                        id: 'last year',
                        title: 'last year'
                    }, {
                        id: '2 year ago',
                        title: '2 year ago'
                    }];
                break;
            case 'custom':
                    this.baseOnList = [{
                        id: 'previous Period',
                        title: 'previous Period'
                    }];
                break;
        }
    }


    private _getFrequency(predefined) {
        let valueMoment = [];
        this.active = true;

        if (this.frequency !== '') {
            switch (this.frequency) {
                case 'monthly':
                        valueMoment[0] = 'this month';
                        const monthNow = Number(moment(Date.now()).format('MM')) ;
                        const monthDife = 12 - monthNow;
                        let index = 1 ;
                        for (index; index < monthDife + 1; index++) {
                            valueMoment[index] = moment(Date.now()).add(index, 'month').format('MMM') ;
                        }
                        this.nodoSelectedText = 'this month';
                        this.baseOnLists(this.frequency);
                    break;
                case 'quarterly':
                    valueMoment[0] = 'this quarter';
                    const quartlyNow = Number(moment().quarter()) ;
                    const quertlyDife = 4 - quartlyNow;
                    let index1 = 1;
                    for (index1; index1 < quertlyDife + 1; index1++) {
                        valueMoment[index1] = 'Q' + (quartlyNow + index1).toString();
                    }
                    this.nodoSelectedText = 'this quarter';
                    this.baseOnLists(this.frequency);
                    break;
                case 'weekly':
                    valueMoment[0] = 'this week';
                    const week = Number(moment(Date.now()).week()) ;
                    const weekDif = 52 - week;
                    let index2 = 1;
                    for (index2; index2 < weekDif + 1; index2++) {
                        valueMoment[index2] = 'W' + (week + index2).toString();
                    }
                    this.nodoSelectedText = 'this week';
                    this.baseOnLists(this.frequency);
                    break;
                case 'yearly':
                        valueMoment[0] = 'this year';
                        this.nodoSelectedText = 'this year';
                        this.baseOnLists(this.frequency);
                    break;
            }
        } else {
            this.nodoSelectedText = predefined;
            switch (predefined) {
                case 'this monthly':
                    this.baseOnLists('monthly');
                    break;
                case 'this quarterly':
                    this.baseOnLists('quarterly');
                    break;
                case 'this weekly':
                    this.baseOnLists('weekly');
                    break;
                case 'this yearly':
                    this.baseOnLists('weekly');
                    break;
                case 'custom':
                    this.noFrequency = true;
                    valueMoment[0] = predefined;
                    this.baseOnLists('custom');
                break;
            }
            valueMoment[0] = predefined;
        }
        // this.frequency = this.nodoSelectedText;
        return valueMoment;
    }
}


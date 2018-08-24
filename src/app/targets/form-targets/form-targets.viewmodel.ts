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
    private frequency: any;


    noFrequency = false;
    activeVisble = false;
    nodoSelectedText = 'NOTHING SELECTED'; 

    constructor() {
        super(null);
    }

    titleAction = 'Add an execution plan for this target';


    objectiveList: SelectionItem[] = [
        { id: '', title: 'NOTHING SELECTED' },
        { id: 'increase', title: 'Increase' },
        { id: 'decrease', title: 'Decrease' },
        { id: 'fixed', title: 'Fixed' },
    ];
    periodList: SelectionItem[] = [
        { id: '', title: 'NOTHING SELECTED' },
        { id: 'pt', title: 'Part Time' },
        { id: 'ft', title: 'Full Time' },
        { id: 'terminate', title: 'Terminated' },
        { id: 'suspend', title: 'suspended' }
    ];
    baseOnList: SelectionItem[] = [];

    userList: SelectionItem[] = [];

    responsiblePeopleList: SelectionItem[] = [{
        id: 'People', title: 'People'
    }];

    statusList: SelectionItem[] = [{
        id: 'due', title: 'Due'
    }];

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
        if(frequency === this.frequency) {
            return;
        }

        this.frequency = frequency;
        this._prepareTargentePeriodListItems(predefined);
    }


    get targetPeriodItems(): SelectionItem[] {
        return this._targetsPeriodItemList;
    }

    private _prepareTargentePeriodListItems(predefined) {
        this._getFrequency(predefined);
        this._targetsPeriodItemList = this._getFrequency(predefined).map(d => ({
            id: d ,
            title: d,
        }));
    }

    private _baseOnList(frequency) {
        switch(frequency) {
            case 'monthly':
                    this.baseOnList = [{ 
                        id: '', 
                        title: 'NOTHING SELECTED' 
                    },{
                        id: 'Last month',
                        title: 'Last month'
                    }, {
                        id: 'Same month, Last year',
                        title: 'Same month, Last year'
                    }, {
                        id: 'Same month, 2 year ago',
                        title: 'Same month, 2 year ago'
                    }];
                break;
            case 'quarterly':
                    this.baseOnList =  [{ 
                        id: '', 
                        title: 'NOTHING SELECTED' 
                    },{
                        id: 'Last quarterly',
                        title: 'Last quarterly'
                    }, {
                        id: 'Same quarterly, Last year',
                        title: 'Same quarterly, Last year'
                    }, {
                        id: 'Same quarterly, 2 year ago',
                        title: 'Same quarterly, 2 year ago'
                    }];
                break;
            case 'yearly':
                    this.baseOnList = [{ 
                        id: '', 
                        title: 'NOTHING SELECTED' 
                    },{
                        id: 'Last year',
                        title: 'Last year'
                    }, {
                        id: '2YearAgo',
                        title: '2 year ago'
                    }];
                break;
            case 'custom':
                    this.baseOnList = [{
                        id: 'Previous Period',
                        title: 'Previous Period'
                    }]
        }
    }

    private _getFrequency(predefined) {
        let valueMoment = [];
        
        switch(this.frequency) {
            case 'monthly':
                    valueMoment[0] = 'NOTHING SELECTED';
                    const monthNow = Number(moment(Date.now()).format('MM')) ;
                    const monthDife = 12 - monthNow;
                    for (let index = 0; index < monthDife + 1; index++) {
                        valueMoment[index + 1] = moment(Date.now()).add(index, 'month').format('MMM') ;
                    }
                    this._baseOnList(this.frequency);
                break;
            case 'quarterly':
                valueMoment[0] = 'NOTHING SELECTED';
                const quartlyNow = this.getQuartely(Number(moment(Date.now()).format('MM'))) ;
                const quertlyDife = 4 - quartlyNow;
                for (let index = 0; index < quertlyDife + 1; index++) {
                    valueMoment[index + 1] = 'Q' + (quartlyNow + index).toString();
                }
                this._baseOnList(this.frequency);
                break;
            case 'yearly':
                    valueMoment[0] = 'This year';
                    this.nodoSelectedText = 'This year';
                    this._baseOnList(this.frequency);
                break;
            default:
                    this.noFrequency = true;
                    valueMoment[0] = predefined;
                    this.activeVisble = true;
                    this.active = true;
                    this.nodoSelectedText = predefined;
                    switch(predefined) {
                        case 'this month':
                            this._baseOnList('monthly');
                            break;
                        case 'this year':
                            this._baseOnList('yearly');
                            break;
                        case 'this quarter':
                            this._baseOnList('quarterly');
                            break;
                        case 'custom':
                            this._baseOnList('custom');
                            break;
                    }
                    
                break;
        }
        return valueMoment;
    }

    private getQuartely(month) {
        if(month < 5) {
            return 1;
        } else if (month < 7 && month > 4) {
            return 2;
        } else if (month < 10 && month > 6) {
            return 3;
        } else {
            return 4;
        }
    }

}


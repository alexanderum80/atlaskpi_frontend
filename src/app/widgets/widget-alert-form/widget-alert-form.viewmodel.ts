import { IUserProfile } from '../../users/shared/models/user';
import { SelectionItem, MenuItem } from '../../ng-material-components';
import { ArrayField, ComplexField, Field, ViewModel } from '../../ng-material-components/viewModels';
import { Injectable } from '@angular/core';
import { FormArray, AbstractControl } from '@angular/forms';
import * as moment from 'moment';

export enum EnumDayOfWeek {
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,
    SUNDAY = 7
}

export const WEEK_DAY = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursay',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday'
};


export interface IAlertModelInfo {
    name: string;
    id: string;
}

export interface IWidgetAlertUsers {
    _id?: string;
    username?: string;
    selected?: boolean;
    profilePictureUrl?: string;
    profile?: IUserProfile;
}

export interface IAlert {
    _id?: string;
    notifyUsers?: IWidgetAlertUsers[] | string[];
    frequency: string;
    active: boolean;
    pushNotification: boolean;
    emailNotified: boolean;
    frequency_day?: string;
    modelAlert?: IAlertModelInfo;
}


@Injectable()
export class WidgetAlertUsers extends ViewModel<IWidgetAlertUsers> {

    @Field({ type: String })
    _id: string;

    @Field({ type: String })
    username: string;

    @Field({ type: Boolean })
    selected: boolean;

    initialize(model: any) {
        this.onInit(model);
    }
}

@Injectable()
export class WidgetAlertFormViewModel extends ViewModel<IAlert> {

    @ArrayField({ type: WidgetAlertUsers })
    notifyUsers: WidgetAlertUsers[];

    @Field({ type: String, required: true })
    frequency: string;

    @Field({ type: Boolean })
    active: boolean;

    @Field({ type: Boolean })
    pushNotification: Boolean;

    @Field({ type: Boolean })
    emailNotified: boolean;

    alertUsers: IWidgetAlertUsers[] = [];
    frequencyAlertItems: MenuItem[] = [
        { id: 'every day', title: 'Every day' },
        { id: 'every business day', title: 'Every business day' },
        { id: 'every end of week', title: 'Every end of week' },
        { id: 'monthly on the 1st', title: 'Every Month on the 1st' },
        { id: 'yearly on Jan 1st', title: 'Every Year on January 1st' }
    ];

    constructor() {
        super(null);
    }

    initialize(model: IAlert): void {
        this.onInit(model);
    }

    update(model: IAlert): void {
        const cleanModel = this.objectWithoutProperties(model, ['__typename']) as any;
        Object.assign(this, cleanModel);
    }

    getUsers(users: any[]): string[] {
        if (!users || !users.length) {
            return [];
        }

        const selectedUsers = [];

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user.selected) {
                selectedUsers.push(user._id);
            }
        }

        return selectedUsers;
    }

    get notifyUserArray(): FormArray {
        return this.fg.get('notifyUsers') as FormArray;
    }

    get userNotifyFg() {
        return this.fg.get('notifyUsers');
    }

    get payload(): IAlert {
        const value = this.fg.value;


        const data = {
            active: value.active ? true : false,
            emailNotified: value.emailNotified ? true : false,
            pushNotification: value.pushNotification ? true : false,
            frequency: value.frequency,
            notifyUsers: this.getUsers(value.notifyUsers) || []
        };

        return data;
    }

    get isFormValid(): boolean {
        return this.fg.valid &&
               (this.fg.value.pushNotification || this.fg.value.emailNotified) &&
               (this.getUsers(this.fg.value.notifyUsers).length ? true : false);
    }

    get dayInString(): string {
        const today: number = moment().weekday();

        switch (today) {
            case EnumDayOfWeek.MONDAY:
                return WEEK_DAY.MONDAY;

            case EnumDayOfWeek.TUESDAY:
                return WEEK_DAY.TUESDAY;

            case EnumDayOfWeek.WEDNESDAY:
                return WEEK_DAY.WEDNESDAY;

            case EnumDayOfWeek.THURSDAY:
                return WEEK_DAY.THURSDAY;

            case EnumDayOfWeek.FRIDAY:
                return WEEK_DAY.FRIDAY;

            case EnumDayOfWeek.SATURDAY:
                return WEEK_DAY.SATURDAY;

            case EnumDayOfWeek.SUNDAY:
                return WEEK_DAY.SUNDAY;
        }
    }
}

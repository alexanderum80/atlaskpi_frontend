import { FrequencyEnum, IDateRange } from '../../../shared/models';
import { IMilestone } from './targets.model';

export interface INotify {
    users: string[];
    notification?: Date;
}

export enum TargetTypeEnum {
    increase = 'increase',
    decrease = 'decrease',
    fixed = 'fixed',
}

export enum TargetValueUnitEnum {
    value = 'value',
    percent = 'percent',
}

export interface ITargetSource {
    type: string;
    identifier: string;
}

export enum DeliveryMethodEnum {
    push = 'push',
    email = 'email',
    sms = 'sms',
}

export interface ITargetUser {
    identifier: string;
    deliveryMethods: DeliveryMethodEnum[];
    email?: boolean;
    push?: boolean;
}

export interface ITargetNotificationConfig {
    users: ITargetUser[];
}

export interface ITargetAppliesTo {
    field: string;
    value: string;
}

export interface ITarget {
    _id?: string;
    name: string;
    source: ITargetSource;
    compareTo: string;
    type: TargetTypeEnum;
    appliesTo?: ITargetAppliesTo;
    value: number;
    unit: TargetValueUnitEnum;
    notificationConfig: ITargetNotificationConfig;
    active?: boolean;
    milestones?: IMilestone[];
}

export interface ISelectableTarget extends ITarget {
    selected: boolean;
}

export function getNewTarget(userId: string) {
    return {
        active: true,
        appliesTo: null,
        compareTo: null,
        _id: null,
        name: null,
        period: null,
        recurrent: false,
        source: {
            type: null,
            identifier: null,
        },
        type: null,
        unit: null,
        value: 0,
        notificationConfig: {
            users: [{ identifier: userId, deliveryMethods: [ DeliveryMethodEnum.email ] }]
        },
        milestones: [],
    } as ITarget;
}
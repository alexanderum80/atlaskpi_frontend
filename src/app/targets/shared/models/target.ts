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
}

export interface ITargetNotificationConfig {
    users: ITargetUser[];
}

export interface ITarget {
    id?: string;
    name: string;
    source: ITargetSource;
    compareTo: string;
    type: TargetTypeEnum;
    appliesTo?: string;
    value: number;
    unit: TargetValueUnitEnum;
    notificationConfig: ITargetNotificationConfig;
    active?: boolean;
    milestones?: IMilestone[];
}

export function getNewTarget(userId: string) {
    return {
        active: true,
        appliesTo: null,
        compareTo: null,
        id: null,
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

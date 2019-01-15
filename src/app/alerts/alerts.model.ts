
export interface IAlerts {
    _id?: string;
    name: string;
    kpi: string;
    frequency: string;
    condition: string;
    value: number;
    active: boolean;
    users: INotificationUsers[];
    createdBy?: string;
    createdAt?: Date;
    updatedBy?: string;
    updatedDate?: Date;
}

export enum DeliveryMethodEnum {
    push = 'push',
    email = 'email'
  }

export interface INotificationUsers {
    identifier: string;
    deliveryMethods: string[];
}

export interface IAlertsCollection {
    _id?: string;
    name: string;
    frequency: string;
    active: boolean;
}

export interface IAlertsList {
    alertsList: IAlertsCollection[];
}

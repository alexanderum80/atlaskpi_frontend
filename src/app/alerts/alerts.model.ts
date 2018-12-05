
export interface IAlerts {
    _id?: string;
    name: string;
    kpi: string;
    frequency: string;
    condition: string;
    value: number;
    notificationUsers: INotificationUsers[];
    active: boolean;
}

export interface INotificationUsers {
    user: string[];
    byEmail: boolean;
    byPhone: boolean;
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

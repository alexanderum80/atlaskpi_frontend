export interface SourceNew {
    type: string;
    identifier: string;
}

export interface UserAll {
    _id: string;
    username: string;
}

export interface DateRangeNew {
    from?: string;
    to?: string;
}

export interface ReportOptionsNew {
    frequency?: string;
    groupings?: string;
    timezone: string;
    dateRange: DateRangeNew;
    filter?: string[];
}

export interface deliveryMethod {
    email: boolean;
    push: boolean;
}

export interface UsersNew {
    id: string;
    deliveryMethod: [string];
}

export interface NotificationConfigNew {
    notifiOnPercente: string;
    users: [UsersNew];
}

export interface ITargetNew {
    _id: string;
    name: string;
    source: SourceNew;
    kpi: string;
    reportOptions: ReportOptionsNew;
    compareTo: string;
    recurrent: string;
    type: string;
    value: string;
    unit: string;
    notificationConfig: NotificationConfigNew;
    owner: string;
    active?: boolean;
    selected?: boolean;
    period: string;
}

export interface ITargetNewInput {
    name: string;
    source: SourceNew;
    kpi: string;
    reportOptions: ReportOptionsNew;
    compareTo: string;
    recurrent: string;
    type: string;
    value: string;
    unit: string;
    notificationConfig: NotificationConfigNew;
    owner: string;
    active?: boolean;
    selected?: boolean;
    period: string;
}



export interface IMilestone {
    _id?: string;
    task: string;
    target: string;
    dueDate: string;
    responsible: string;
    status?: string;
}

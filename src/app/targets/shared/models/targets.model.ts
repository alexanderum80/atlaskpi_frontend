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

export interface ITargetSource {
    type: string;
    identifier: string;
}

export interface IDeliveryMethod {
    email: boolean;
    push: boolean;
}

export interface ITargetUser {
    id: string;
    email: boolean;
    push: boolean;
}

export interface ITargetNotificationConfig {
    users: ITargetUser[];
}

export interface ITargetFormFields {
    name: string;
    source: ITargetSource;
    kpi: string;
    compareTo: string;
    recurrent: boolean;
    type: string;
    unit: string;
    value: number;
    appliesTo: string;
    active: boolean;
    period: string;
    notificationConfig: ITargetNotificationConfig;
}

export interface ITargetNew {
    _id?: string;
    name: string;
    source: SourceNew;
    kpi: string;
    reportOptions: ReportOptionsNew;
    compareTo: string;
    recurrent: string;
    type: string;
    value: string;
    unit: string;
    notificationConfig: ITargetNotificationConfig;
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
    notificationConfig: ITargetNotificationConfig;
    owner: string;
    active?: boolean;
    selected?: boolean;
    period: string;
    createdBy?: string;
    createdDate?: Date;
    updatedBy?: string;
    updatedDate?: Date;
}



export interface IMilestone {
    task: string;
    dueDate: Date;
    responsible: string[];
    status?: string;
}

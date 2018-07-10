export interface INotify {
    users: string[];
    notification: string;
}

export interface ITarget {
    _id?: string;
    id?: string;
    name: string;
    datepicker: string;
    vary: string;
    amount: string;
    amountBy: string;
    type: string;
    active: string;
    period: string;
    notify?: INotify;
    visible: string[];
    owner: string;
    chart: string[];
    target: number;
    stackName?: string;
    nonStackName?: string;
}


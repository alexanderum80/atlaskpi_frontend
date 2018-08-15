export interface ITarget {
    _id: string;
    name: string;
    objective: string;
    value: number;
    period: string;
    baseOn: string;
    repeat: string;
    active: boolean;
    nextDueDate: string;
    relatedUser: IRelatedUser;
    milestone: IMilestone;
    selected?: boolean;
}

export interface IRelatedUser {
    user: string;
    email: string;
    phone: string;
}

export interface IMilestone {
    description: string;
    completionDate: string;
    responsiblePeople: string;
    status: string;
}

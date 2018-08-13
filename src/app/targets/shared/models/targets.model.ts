export interface ITarget {
    _id: string;
    name: string;
    objetive: string;
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
    completetionDate: string;
    responsiblePeople: string;
    status: string;
}

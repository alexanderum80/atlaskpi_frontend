export interface IMilestone {
    _id: string;
    id: string;
    target: string;
    task: string;
    dueDate: Date;
    status: string;
    responsible: [string];
}

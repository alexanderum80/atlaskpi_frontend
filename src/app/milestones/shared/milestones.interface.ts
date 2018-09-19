export interface IMilestone {
    _id: string;
    target: string;
    task: string;
    dueDate: Date;
    status: string;
    responsible: [string];
}

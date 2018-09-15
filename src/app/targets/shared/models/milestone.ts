export interface IMilestone {
    _id: string;
    task: string;
    dueDate: Date;
    status: string;
    responsible: string[];
}

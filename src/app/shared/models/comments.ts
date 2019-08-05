import { IUserCommentPayload } from './comments';

export interface IUserComment {
    id: string;
    read: boolean;
}

export interface IUserCommentPayload {
    id: string;
    read: boolean;
}

export interface ICommentsChildren {
    _id: string;
    users: IUserComment[];
    message: string;
    deleted: boolean;
    createdBy: string;
    createdDate: Date;
}

export interface ICommentsChildrenPayload {
    _id: string;
    users: IUserCommentPayload[];
    message: string;
    deleted: boolean;
    createdBy: string;
    createdDate: Date;
}

export interface IComment {
    _id: string;
    chart: string;
    users: IUserComment[];
    message: string;
    formattedMessage?: string;
    deleted: boolean;
    children: ICommentsChildren[];
    createdBy: string;
    createdDate: Date;
}

export interface ICommentPayload {
    chart: string;
    users: IUserCommentPayload[];
    message: string;
    deleted: boolean;
    children: ICommentsChildrenPayload[];
    createdBy: string;
    createdDate: Date;
}

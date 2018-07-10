import { IEntity } from './../../../activities/shared/models/activity-models';

// export interface IAppointment {
//     _id: string;
//     fullName?: string;
//     reason: string;
//     from: Date;
//     to?: Date;
//     provider?:  string;
//     state?: string;
// }

export interface IAppointmentEvent extends IEntity {
    code: string;
    color: string;
    conflictColor: string;
    cancelledColor: string;
}

export interface IAppointment {
    // Appointment
    _id?: string;
    source: string;
    reason: string;
    comments: string;
    from: Date;
    to?: Date;
    duration: number;
    approved: boolean;
    checkedIn: boolean;
    checkedOut: boolean;
    cancelled: boolean;
    checkedInOn: Date;
    checkedOutOn: Date;
    cancelledOn: Date;
    confirmedOn: Date;
    createdOn: Date;
    customer: IEntity;
    provider: IEntity[];
    location: IEntity;
    event: IAppointmentEvent;
}


export class Appointment {
    private __id: string;
    get _id(): string{ return this.__id; }

    private _source: string;
    get source(): string  { return this._source; }

    private _fullName: string;
    get fullName(): string {return this._fullName; }

    private _from: Date;
    get from(): Date {return this._from; }

    private _to: Date;
    get to(): Date {return this._to; }

    private _reason: string;
    get reason(): string {return this._reason; }

    private _provider: string;
    get provider(): string {return this._provider; }

    static Create(id: string, fullName: string, from: Date, reason: string, to?: Date): IAppointment {
        const instance = new Appointment(id, fullName, from, reason, to);
        // return instance.from ? instance : null;
        return <any>instance;
    }

    private constructor(id: string, fullName: string, from: Date, reason: string, to?: Date) {
        if (!reason || !from) {
            return;
        }

        this.__id = id;
        this._from = from;
        this._to = to;
        this._fullName = fullName;
        this._reason = reason;
    }

}
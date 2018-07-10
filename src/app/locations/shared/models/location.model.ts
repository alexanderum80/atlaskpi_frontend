import { ITaggable } from '../../../shared/domain/shared/taggable';

export interface IOperationHours {
    day: string;
    from: string;
    to: string;
    fromAMPM: string;
    toAMPM: string;
}

export interface ILocation extends ITaggable {
    _id: string;
    name: string;
    description: string;
    businessunits: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    timezone: string;
    operhours: IOperationHours[];
}

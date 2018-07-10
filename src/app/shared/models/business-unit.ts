import { IdName } from './idName';

export interface NamedType {
    _id?: string;
    name: string;
}

export interface IBusinessUnit {
    _id?: string;
    name: string;
    industry: IdName;
    subIndustry?: IdName;
    shortName?: string;
    active?: boolean;

    phone?: string | number;
    website?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    timezone?: string;
    timeFormat?: string;
    dateFormat?: string;
    defaultCurrency?: string;
    defaultLanguage?: string;
    firstDayOfWeek?: string;
}

export class BusinessUnit implements IBusinessUnit {
    name: string;
    industry: IdName;
    subIndustry?: IdName;
    shortName?: string;
    active?: boolean;

    phone?: string | number;
    website?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    timezone?: string;
    timeFormat?: string;
    dateFormat?: string;
    defaultCurrency?: string;
    defaultLanguage?: string;
    firstDayOfWeek?: string;

    constructor(unit: BusinessUnit | Object) {
        Object.assign(this, unit);
    }
}

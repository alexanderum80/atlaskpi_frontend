import { IdName } from './idName';

export class SubIndustry extends IdName { }

export class Industry extends IdName {
    subIndustries?: IdName[];
    subIndustry?: SubIndustry;

    constructor(obj: Industry | any) {
        super();
        Object.assign(this, obj);
    }
}


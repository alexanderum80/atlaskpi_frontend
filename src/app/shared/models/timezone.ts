export class Timezone {
    value: string;
    abbr: string;
    offset: number;
    isdst: boolean;
    text: string;
    utc: string[];

    constructor(obj: Timezone | any) {
        Object.assign(this, obj);
    }
}

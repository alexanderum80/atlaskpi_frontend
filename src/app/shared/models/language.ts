export class Language {
    code: string;
    name: string;
    nativeName: string;

    constructor(obj: Language | any) {
        Object.assign(this, obj);
    }
}

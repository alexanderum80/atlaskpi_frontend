export class Currency {
    id: string;
    cc: string;
    symbol: string;
    name: string;

    constructor(obj: Currency | any) {
        Object.assign(this, obj);
        this.id = obj.cc;
    }

    get displayName(): string {
        return `(${this.symbol}) ${this.name}`;
    }
}

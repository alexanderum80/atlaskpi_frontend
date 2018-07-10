export interface IEntity {
    externalId: string | number;
    name: string;
}

export interface ISaleLocation {
    identifier: string;
    name: string;
    city: string;
    state: string;
    zip: string;

    type: string;
    size: string;
}

export interface ISaleCustomer extends IEntity {
        city: string;
        state: string;
        zip: string;
        gender: string;
}


export interface ISaleEmployee extends IEntity {
    fullName: string;
    role: string;
    type: string; // full time (f), part time (p)
    workedTime: number; // in seconds
}

export interface ISaleProduct extends IEntity {
    itemCode: string;
    itemDescription: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    tax2: number;
    amount: number;
    paid: number;
    discount: number;
    from: Date;
    to: Date;
}

export interface ICategory extends IEntity {
    service: number;
}

export interface ISales {
    externalId: string;
    location: ISaleLocation;
    customer: ISaleCustomer;
    employee: ISaleEmployee;
    product: ISaleProduct;
    category: ICategory;

    timestamp: Date;
    concept: string;
    document: {
        type: string, // invoice, bill, charge, etc
        identifier: string
    };

    payment: {
        method: string; // cash, credit, check
        type: string;   // visa, master card
        amount: number;
    };
}

export interface IAmounts {
    totalCount: number;
    total: number;
    employee?: string;
}

export interface IUsersActivity {
    _id: string;
    timestamp: Date;
    accessBy: string;
    event: string;
    eventType: string;
    payload: string;
}

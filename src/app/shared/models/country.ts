export interface ICountry {
    name: string;
    _id: string;
    continent: string;
    filename: string;
}

export interface IState {
    _id: string;
    country: string;
    name: string;
    code: string;
}

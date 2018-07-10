export interface IFieldErrors {
    field: string;
    errors: string[];
}

export interface IMutationResponse {
    success?: boolean;
    entity?: any;
    errors?: IFieldErrors[];
}

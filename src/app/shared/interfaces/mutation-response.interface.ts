export interface IMutationError {
    field: string;
    errors: string[];
}

export interface IMutationResponse {
    success?: boolean;
    entity?: any;
    errors?: IMutationError[];
}

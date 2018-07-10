export interface IQueryResponse<T> {
    success?: boolean;
    data?: T[] | T;
    errors?: { field: string, errors: string[] }[];
}


export interface IPaginationDetails {
    page: number;
    itemsPerPage: number;
    sortBy?: string;
    filter?: string;
}

export const PaginationDetailsDefault: IPaginationDetails = {
    page: 1,
    itemsPerPage: 25,
    sortBy: null
};

export interface IPaginationInfo {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
}

export interface IPagedQueryResult<T> {
    pagination: IPaginationInfo;
    data: T[];
}

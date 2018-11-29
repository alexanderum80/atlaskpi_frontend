export interface IDataSourceField {
    name: string;
    path: string;
    type: string;
    allowGrouping: boolean;
    available?: boolean;
}

export interface IFilterOperator {
    description: string;
    name: string;
    oper: string;
    exp: string;
    listSeparator: string;
}

export interface IDataTypeFilters {
    Number: IFilterOperator[];
    String: IFilterOperator[];
}

export interface IDataSource {
    name: string;
    description: string;
    dataSource: string;
    fields: IDataSourceField[];
    groupings: string[];
    filterOperators: IDataTypeFilters;
    externalSource?: boolean;
    sources?: string[];
    createdBy?: string;
    createdDate?: Date;
}

export interface IDataSourceFilterFields {
    dataSource: string;
    fields: IDataSourceField[];
    collectionSource?: string[];
}

export interface IExternalDataSource extends IDataSource {
    id: string;
    conenctorId: string;
    connectorType: string;
}

export interface ICustomSchema {
    schema: ICustomSchemaInfo[];
    data: ICustomDataInfo[];
    dataName: string;
    dateRangeName?: string;
}

export interface ICustomSchemaInfo {
    columnName: string;
    dataType: string;
    dateRangeField: boolean;
}

export interface ICustomDataInfo {
    fieldname: string;
}

export interface IDataType {
    number: string;
    string: string;
    date: string;
    boolean: string;
}

export interface ICustomData {
    inputName: string;
    fields: string;
    records: string;
}


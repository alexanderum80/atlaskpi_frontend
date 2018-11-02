export interface ICustomSchema {
    schema: ICustomSchemaInfo[];
    data: ICustomDataInfo[];
    dataName: string;
    dateRangeField: string;
}

export interface ICustomSchemaInfo {
    columnName: string;
    dataType: string;
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
    dateRangeField: string;
}


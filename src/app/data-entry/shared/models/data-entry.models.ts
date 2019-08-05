import { MenuItem } from '../../../ng-material-components';

export enum DataEntryTypeEnum {
    None = 0,
    UploadFile = 1,
    DefineSchema = 2,
    PredefinedTemplates = 3
}

export interface IDataSourceField {
    name: string;
    path: string;
    type: string;
    allowGrouping: boolean;
    available?: boolean;
    required?: boolean;
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

export interface IDataEntrySource {
    _id: string;
    name: string;
    description: string;
    dataSource: string;
    dateField: string;
    fields: IDataSourceField[];
    groupings: string[];
    filterOperators: IDataTypeFilters;
    externalSource?: boolean;
    sources?: string[];
    createdBy?: string;
    createdDate?: Date;
    type: string;
    dataEntry: boolean;
    users: string[];
}

export interface DataEntryList {
    _id: string;
    name: string;
    description: string;
    virtualSource: string;
    image: string;
    users: string[];
    actionItems: MenuItem[];
}

export interface CustomList {
    _id?: string;
    name: string;
    dataType: string;
    listValue: string[];
}

export interface FileField {
    columnName: string;
    dataType: string;
    required: boolean;
}

export interface FilesData {
    inputName: string;
    fields: FileField[];
    records: any[];
    dateRangeField: string;
    filePath: string;
}

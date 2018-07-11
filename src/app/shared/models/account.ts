import { IBusinessUnit } from './business-unit';
import { IUserToken } from './user-token';

export interface IPersonalInfo {
    fullname?: string;
    email: string;
    timezone: string;
}

export interface IBusinessInfo {
    numberOfLocations: number;
    country: string;
    phoneNumber: string;
}

export interface IDatabaseInfo {
    uri: string;
    name: string;
}

export interface IAudit {
    createdOn: Date;
    updatedOn: Date;
}

export interface IAccountDetails {
    name: string;
    personalInfo: IPersonalInfo;
    seedData?: boolean;
    authorizationCode: string;
}

export interface IAccount {
    name: string;
    personalInfo: IPersonalInfo;
    businessInfo?: IBusinessInfo;
    database?: IDatabaseInfo;
    audit?: IAudit;
    businessUnits?: IBusinessUnit[];
    initialToken?: IUserToken;
    seedData?: boolean;
}

export interface ICreateAccountResult {
    _id: string;
    name: string;
    personalInfo: IPersonalInfo;
    initialToken?: IUserToken;
}

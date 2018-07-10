import { IAddress } from '../../../shared/models';

export interface IEmploymentInfo {
    location: string;
    bussinessUnit: string;
    department: string;
    position: string;
    startDate: string;
    typeOfEmployment: string;
    frequency: string;
    rate: string;
}

export interface IEmployee {
    _id?: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    primaryNumber: string;
    dob: string;
    nationality: string;
    maritalStatus: string;
    address: IAddress;

    employmentInfo: [IEmploymentInfo];
}

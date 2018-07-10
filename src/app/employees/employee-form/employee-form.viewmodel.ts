// Angular Imports
import { Injectable } from '@angular/core';

import { SelectionItem } from '../../ng-material-components/models';
import { ArrayField, ComplexField, Field } from '../../ng-material-components/viewModels';
import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { AddressViewModel } from '../../shared/view-models/address.viewmodel';
import { IEmployee, IEmploymentInfo } from '../shared/models/employee.model';

// App Code

export class EmploymentInfoViewModel extends ViewModel<IEmploymentInfo> {

    @Field({ type: String /*, required: true*/ })
    location: string;

    @Field({ type: String, required: true })
    bussinessUnit: string;

    @Field({ type: String, required: true })
    department: string;

    @Field({ type: String })
    position: string;

    @Field({ type: String })
    startDate: string;

    @Field({ type: String })
    typeOfEmployment: string;

    @Field({ type: String })
    frequency: string;

    @Field({ type: String })
    rate: string;

    initialize(model: IEmploymentInfo): void {
        this.onInit(model);
    }
}

@Injectable()
export class EmployeeFormViewModel extends ViewModel<IEmployee> {

    constructor() {
        super(null);
    }

    locations: SelectionItem[];
    businessUnits: SelectionItem[];
    departments: SelectionItem[];
    countries: SelectionItem[];
    states: SelectionItem[];
    employmentTypes: SelectionItem[] = [
        { id: 'pt', title: 'Part Time' },
        { id: 'ft', title: 'Full Time' },
        { id: 'terminate', title: 'Terminated' },
        { id: 'suspend', title: 'suspended' }
    ];

    @Field({ type: String })
    _id?: string;

    @Field({ type: String, required: true })
    firstName: string;

    @Field({ type: String })
    middleName: string;

    @Field({ type: String, required: true })
    lastName: string;

    @Field({ type: String, required: true })
    email: string;

    @Field({ type: String })
    primaryNumber: string;

    @Field({ type: Date })
    dob: string;

    @Field({ type: String })
    nationality: string;

    @Field({ type: String })
    maritalStatus: string;

    @ComplexField({ type: AddressViewModel })
    address: AddressViewModel;

    @ArrayField({ type: EmploymentInfoViewModel })
    employmentInfo: EmploymentInfoViewModel[];

    public initialize(model: IEmployee): void {
        this.onInit(model);
    }

    get addPayload() {
        const value = this.modelValue;
        delete(value._id);

        return { employeeAttributes: value };
    }

    get editPayload() {
        return { _id: this._id, employeeAttributes: this.addPayload.employeeAttributes };
    }
}

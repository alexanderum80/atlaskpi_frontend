// Angular Imports
import { Injectable } from '@angular/core';

import { Field } from '../../ng-material-components/viewModels';
import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { IBusinessUnit } from '../shared/models/business-unit.model';

// App Code
@Injectable()
export class BusinessUnitFormViewModel extends ViewModel<IBusinessUnit> {

    constructor() {
        super(null);
    }

    @Field({ type: String, required: true })
    name: string;

    @Field({ type: String})
    serviceType: string;


    initialize(model: any): void {
        this.onInit(model);
    }

    get addPayload() {
        const value = this.modelValue;

        return {
            name: value.name,
            serviceType: value.serviceType
        };
    }

    get editPayload() {
        const value = this.addPayload as any;

        return {
            _id: this._id,
            name: value.name,
            serviceType: value.serviceType
        };
    }

}

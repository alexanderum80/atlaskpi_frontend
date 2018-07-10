import { Injectable } from '@angular/core';
import { IDepartment } from '../shared/models/department.model';
import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { Field } from '../../ng-material-components/viewModels';

@Injectable()
export class FormDepartmentViewModel extends ViewModel<IDepartment> {

    constructor() {
        super(null);
    }


    @Field({ type: String, required: true })
    name: string;

    @Field({ type: String })
    manager: string;

    initialize(model: any): void {
        this.onInit(model);
    }

    get addPayload() {
        const value = this.modelValue;

        return {
            name: value.name,
            manager: value.manager
        };
    }

    get editPayload() {
        const value = this.addPayload as any;
        value.id = this._id;

        return value;
    }

}

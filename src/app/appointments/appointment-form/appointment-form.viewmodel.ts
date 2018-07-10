// Angular Imports
import {
    Injectable
} from '@angular/core';

// App Code
import {
    IAppointment
} from '../shared/models/appointment.model';
import {
    ViewModel
} from '../../ng-material-components/viewModels/view-model';
import {
    Field
} from '../../ng-material-components/viewModels';

@Injectable()
export class AppointmentFormViewModel extends ViewModel<IAppointment> {

    constructor() {
        super(null);
    }

    @Field({ type: String, required: true })
    source: string;

    @Field({ type: String, required: true })
    fullname: string;

    @Field({ type: String, required: true })
    reason: string;

    @Field({ type: String, required: true })
    from: string;

    @Field({ type: String, required: true })
    to: string;


    initialize(model: any): void {
        this.onInit(model);
    }

    get addPayload() {
        const value = this.modelValue;

        return {
            /* ADD PAYLOAD FIELDS HERE */
        };
    }

    get editPayload() {
        const value = this.addPayload as any;
        value.id = this._id;

        return {
            /* EDIT PAYLOAD FIELDS HERE */
        };
    }

}

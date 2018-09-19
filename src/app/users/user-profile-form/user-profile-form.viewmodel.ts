// Angular Imports
import { Injectable } from '@angular/core';

import { SelectionItem } from '../../ng-material-components/models';
import { ArrayField, ComplexField, Field } from '../../ng-material-components/viewModels';
import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { AddressViewModel } from '../../shared/view-models/address.viewmodel';
import { IEmploymentInfo, IEmployee } from '../../employees/shared/models/employee.model';
import { UserProfileViewModel } from '../user-profile/user-profile.viewmodel';
import { IUser, IUserProfile, IUserEmail, IUserNotifications, IUserPreference, IUserProfileData } from '../shared';
import { generateTimeZoneOptions } from '../../shared/helpers/timezone.helper';

// Yojanier

@Injectable()
export class UserProfileFormViewModel extends ViewModel<IUserProfileData> {

    timeZoneList: SelectionItem[] = generateTimeZoneOptions();

    constructor() {
        super(null);
    }

    @Field({ type: String, required: true })
    firstName: string;

    @Field({ type: String })
    middleName: string;

    @Field({ type: String, required: true })
    lastName: string;

    @Field({ type: String })
    phoneNumber: string;

    @Field({ type: String })
    timezone: string;

    @Field({ type: String, required: true, disabled: true })
    email: string;

    @Field({ type: Boolean })
    general?: boolean;

    @Field({ type: Boolean })
    chat?: boolean;

    @Field({ type: Boolean})
    viaEmail?: boolean;

    @Field({ type: Boolean})
    dnd?: boolean;

    initialize(model: any): void {
        this.onInit(model);
    }

    get editPayload() {
        const value = this.modelValue;

        if (value.general == null) {
            value.general = false;
        }
        if (value.chat == null) {
            value.chat = false;
        }
        if (value.viaEmail == null) {
            value.viaEmail = false;
        }
        if (value.dnd == null) {
            value.dnd = false;
        }


        return {id: this._id, input: value};
    }
}

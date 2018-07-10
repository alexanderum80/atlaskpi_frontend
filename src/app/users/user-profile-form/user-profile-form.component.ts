// Angular Import
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CommonService } from '../../shared/services/common.service';
import { SelectPickerService } from '../../shared/services/select-picker.service';
import { IUserProfileData } from '../shared';
import { UserProfileFormViewModel } from './user-profile-form.viewmodel';
import { IUserInfo } from '../../shared/models';
import { UserProfileViewModel } from '../user-profile/user-profile.viewmodel';

// App Code

@Component({
    selector: 'kpi-user-profile-form',
    templateUrl: './user-profile-form.component.pug',
    providers: [UserProfileFormViewModel]
})
export class UserProfileFormComponent implements OnInit, OnDestroy {
    /// modificar
    @Input() model: IUserInfo;
    notifications = false;

    private _subscription: Subscription[] = [];

    constructor(
        public vm: UserProfileFormViewModel,
        private _selectPickerService: SelectPickerService) {}

    ngOnInit(): void {
        const model = this.model;
        const vmData: any = {
            _id: model._id,
            firstName: model.profile.firstName,
            middleName: model.profile.middleName,
            lastName: model.profile.lastName,
            phoneNumber: model.profile.phoneNumber,
            email: model.username,
            timezone: model.profile.timezone
        };

        if (model.preferences && model.preferences.notification) {
            vmData.general = model.preferences.notification.general;
            vmData.chat = model.preferences.notification.chat;
            vmData.viaEmail = model.preferences.notification.email;
            vmData.dnd = model.preferences.notification.dnd;
        }

        this.vm.initialize(vmData);
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    update(model: IUserProfileData): void {
        this.vm.update(model);
    }

}

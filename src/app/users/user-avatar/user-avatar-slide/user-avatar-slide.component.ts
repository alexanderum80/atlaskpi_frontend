import { isEmpty } from 'lodash';

import { IUserInfo } from '../../../shared/models/user';
import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import {AuthenticationService, UserService, CommonService} from '../../../shared/services';
import {ApolloService} from '../../../shared/services/apollo.service';
import { UploadTypeEnum } from '../../../shared/services/upload.service';
import { IUserProfileData } from '../../shared';
import { UserProfileComponent } from '../../user-profile/user-profile.component';

@Component({
    selector: 'kpi-user-avatar-slide',
    templateUrl: './user-avatar-slide.component.pug',
    styleUrls: ['./user-avatar-slide.component.scss']
})
export class UserAvatarSlideComponent implements OnInit, OnDestroy {
    @Input() userId = '';

    avatarAddress: string;
    fullName = '';
    email = '';
    idUser: string;
    showModal = false;
    uploadMetadata = {
        type: UploadTypeEnum.ProfilePicture
    };

    private _subscription: Subscription[] = [];

    constructor(
        private _apolloService: ApolloService,
        private _authService: AuthenticationService,
        private _userService: UserService) {}

    ngOnInit() {
        const that = this;

        this._subscription.push(this._userService.user$.subscribe((user) => {
            that._setUserInfo(user);
        }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    editUser() {
        this.showModal = true;
    }

    uploadCompleted(event) {
        this._userService.updateUserInfo(true);
    }

    profileClose() {
        this.showModal = false;
    }

    logout() {
        this._authService.logout();
    }

    private _canSetUserProfile(user: IUserInfo): boolean {
        return (user.profile &&
               !isEmpty(user.profile) &&
               user.profile.firstName
        ) ? true : false;
    }

    private _setUserInfo(user: IUserInfo): void {
        // return if user is undefined/null
        if (!user) { return; }

        // add firstname and lastname if exists
        if (this._canSetUserProfile(user)) {
            this.fullName = user.profile.firstName + ' ' + user.profile.lastName;
        } else {
            this.fullName = user.username;
        }

        this.email = user.username;
        this.avatarAddress = user ? user.profilePictureUrl : '';
    }
}

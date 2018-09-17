import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import Sweetalert from 'sweetalert2';

import { ModalComponent } from '../../ng-material-components';
import { IUserInfo, User } from '../../shared/models';
import { UserService } from '../../shared/services';
import { ApolloService } from '../../shared/services/apollo.service';
import { UploadTypeEnum } from '../../shared/services/upload.service';
import { IUser } from '../shared';
import { UserProfileFormComponent } from '../user-profile-form/user-profile-form.component';
import { UserProfileViewModel } from './user-profile.viewmodel';
import { Apollo, QueryRef } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import { Observable } from 'rxjs/Observable';

const EditUserProfileMutation = require('graphql-tag/loader!./edit-user-profile.gql');
const usersApi = {
    current: require('graphql-tag/loader!../../users/shared/graphql/current-user.gql')
};

@Component({
    selector: 'kpi-user-profile',
    templateUrl: './user-profile.component.pug',
    styleUrls: ['./user-profile.component.scss'],
    providers: [UserProfileViewModel]
})
export class UserProfileComponent implements OnInit {
    @ViewChild('userProfileForm') private _form: UserProfileFormComponent;
    @ViewChild('userProfileEdit') private _editUserModal: ModalComponent;

    @Output() onUserProfileClose = new EventEmitter();

    currentUserQuery: QueryRef<any>;
    title: string;
    avatarAddress: string;
    viewItems = true;
    user: IUserInfo;

    uploadMetadata = {
        type: UploadTypeEnum.ProfilePicture
    };

    private _subscription: Subscription[] = [];

    constructor(
        private _apolloService: ApolloService,
        private _userService: UserService,
        private _apollo: Apollo
    ) { }

    ngOnInit() {
        const that = this;

        this._userService.updateUserInfo(true);
        this._subscription.push(this._userService.user$.subscribe((user) => {
            that.user = user; 
            this.avatarAddress = user ? user.profilePictureUrl : '';
        }));

        this.reloadUser();
    }

    reloadUser() {
        const that = this;
        this._apollo.query<ApolloQueryResult<IUserInfo>>({
            query: usersApi.current,
            fetchPolicy: 'network-only'
        }).subscribe(({data}) => {
            const newUser = <any>data['User'];
            that.user = newUser;
        });

    }

    cancel(): void {
        this.onUserProfileClose.emit();
    }
    
    open(id: string): void {
        const that = this;
        this._editUserModal.open();
        this.title = id;
    }

    uploadCompleted(event) {
        this._userService.updateUserInfo(true);
    }

    save() {
        const that = this;
        if (this._form.vm.valid) {
            this._apolloService.mutation < IUser > (EditUserProfileMutation, this._form.vm.editPayload)
                .then(res => {
                    this.onUserProfileClose.emit();
                }).catch(err => {
                    Sweetalert({
                        title: 'Error Updating Profile',
                        text: `There was an error while saving the profile information. Please contact our support team.
                               We apologize for the inconvenience.`,
                        type: 'error',
                        showConfirmButton: true,
                        confirmButtonText: 'Ok'
                    });
                });
        }
    }

}

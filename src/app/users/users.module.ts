import { UsersLogComponent } from './users-log/users-log.component';
import { RolesModule } from '../roles';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
// import { LocaleModule, LocalizationModule } from 'angular2localization';
// import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users/users.component';
import { AuthComponent } from './auth/auth.component';
import { ForgotComponent } from './auth/forgot/forgot.component';

import { UsersService } from './shared/services';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { VerifyEnrollmentComponent } from './auth/verify-enrollment/verify-enrollment.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { StartComponent } from './start/start.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { InitializeComponent } from './initialize/initialize.component';

import { SignupService } from './shared/services';
import { AddUserComponent } from './add-user/add-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { ListUsersComponent } from './list-users/list-users.component';
import { UserFormComponent } from './user-form/user-form.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { UserAgreementComponent } from './user-agreement/user-agreement.component';
// by yojanier
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserProfileFormComponent } from './user-profile-form/user-profile-form.component';
import { UserAvatarSlideComponent } from './user-avatar/user-avatar-slide/user-avatar-slide.component';
import { AvatarUploadService } from './shared/services/avatar-upload.service';
import { HttpHeaders } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    UsersRoutingModule,

    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialUserInterfaceModule,
    MaterialFormsModule,
    NgxDatatableModule,
    // for image upload
     // SimpleImageUploadModule,

    RolesModule
    // NgxDatatableModule,
  ],
  exports: [
    AuthComponent,
    UsersComponent,
    UserProfileComponent,
    UserAvatarSlideComponent,
    UserAgreementComponent
  ],
  declarations: [
    // signin
    // ForgotPasswordComponent,
    // LoginComponent,
    // SignInComponent,
    // VerifyEmailComponent,
    UsersComponent,
    AuthComponent,
    ForgotComponent,
    ResetPasswordComponent,
    VerifyEnrollmentComponent,
    SignUpComponent,
    StartComponent,
    SignInComponent,
    InitializeComponent,
    AddUserComponent,
    EditUserComponent,
    ListUsersComponent,
    UserFormComponent,
    UsersLogComponent,
    UserAgreementComponent,
    UserAvatarSlideComponent,
    UserProfileComponent,
    UserProfileFormComponent
  ],
  providers: [
    UsersService,
    SignupService,
    // by yojanier
    AvatarUploadService/* ,
    HttpHeaders */
  ]
})
export class UsersModule { }

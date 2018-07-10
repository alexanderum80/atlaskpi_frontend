import { AuthGuard } from '../shared/services/auth-guard.service';
import { UsersLogComponent } from './users-log/users-log.component';
import { InitializeComponent } from './initialize';
import { StartComponent } from './start/start.component';
import { SignUpComponent } from './sign-up/sign-up.component';

import {
    NgModule
} from '@angular/core';
import {
    Routes,
    RouterModule
} from '@angular/router';

import {
    UsersComponent
} from './users/users.component';
import {
    ForgotComponent
} from './auth/forgot';
import {
    ResetPasswordComponent
} from './auth/reset-password';
import {
    VerifyEnrollmentComponent
} from './auth/verify-enrollment';
import { UserProfileComponent } from './user-profile/user-profile.component';

const routes: Routes = [{
    path: 'start',
    component: StartComponent
},
{
    path: 'users',
    component: UsersComponent,
    children: [
        // signin
        {
            path: 'forgot-password',
            component: ForgotComponent,
            data: {
                hideLayout: true
            }
        },
        {
            path: 'reset-password/:token',
            component: ResetPasswordComponent
        },
        {
            path: 'reset-password/:token/:companyName',
            component: ResetPasswordComponent
        },
        {
            path: 'verify-enrollment/:token',
            component: VerifyEnrollmentComponent
        },
        {
            path: 'initialize/:base64token',
            component: InitializeComponent
        },
        {
            path: 'audit',
            component: UsersLogComponent,
            canActivate: [AuthGuard]
        },
        {
            path: 'edit',
            component: UserProfileComponent
        }
        // {
        //     path: 'logoff',
        //     component: LogoffComponent
        // }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule {}
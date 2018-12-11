import { IPermission } from '../../permissions/shared/models';
import { IRole } from '../../users/shared';
import { AllPermissions } from '../authorization/permissions/all-permissions';
import { flatten, pick, uniqBy } from 'lodash';

export interface IUserEmail {
    address: string;
    verified: boolean;
}

export interface IUserLoginToken {
    when: Date;
    hashedToken: string;
    clientId: string;
}

export interface IEmbeddedDocument {
    remove?();
}

export interface IUserEmailedToken extends IEmbeddedDocument {
    token: string;
    email: string;
    when: Date;
}

export interface IUserServices {
    loginTokens?: IUserLoginToken[];
    password?: {
        reset?: IUserEmailedToken
    };
    email?: {
        verificationTokens?: IUserEmailedToken[],
        enrollment?: IUserEmailedToken[],
    };
}

export interface IUserAgreement {
    accept: boolean;
}

export interface IUserProfile {
    firstName: string;
    middleName?: string;
    lastName?: string;
    sex?: string;
    dob?: Date;
    phoneNumber?: string;
    timezone?: string;
    agreement?: IUserAgreement;
}
export class IUserNotifications {
    general?: boolean;
    chat?: boolean;
    email?: boolean;
    dnd?: boolean;
}
export class IUserPreference {
    chart?: {
        showTour: boolean;
    };
    notification?: IUserNotifications;
    helpCenter?: boolean;
    showAppointmentCancelled?: boolean;
    providers?: string;
    calendarTimeZone?: string;
    dashboardIdNoVisible?: string;
    dashboards?: {
        listMode: string;
    };
    charts?: {
        listMode: string;
    };
    kpis?: {
        listMode: string;
    };
    roles?: {
        listMode: string;
    };
    users?: {
        listMode: string;
    };
    theme?: string;
}

export interface IUserInfo {
    _id?: string;
    username: string;
    password?: string;
    emails: IUserEmail[];
    services?: IUserServices;
    profile: IUserProfile;
    preferences?: IUserPreference;
    roles?: IRole[];
    permissions?: IPermission[];
    profilePictureUrl: string;
    ownerAgreed?: boolean;

    hasPermission(permission: IPermission);
    hasAllPermissions(permissions: IPermission[]);
}

export class User implements IUserInfo {
    username: string;
    password?: string;
    emails: IUserEmail[];
    services?: IUserServices;
    profile: IUserProfile;
    roles?: IRole[];
    permissions: IPermission[];
    profilePictureUrl: string;

    constructor(userInfo: IUserInfo | Object) {
        Object.assign(this, userInfo);

        this._preparePermissions();
    }

    hasPermission(perm: IPermission) {
        return this.permissions.findIndex(p => p.action === perm.action && p.subject === perm.subject) !== -1;
    }

    hasAllPermissions(permissions: IPermission[]) {
        const that = this;
        let ownAllPermissions = true;
        permissions.forEach(p => {
            if (!that.hasPermission(p))  { ownAllPermissions = false; }
        });

        return ownAllPermissions;
    }

    private _preparePermissions() {
        // assign all roles to owner role
        if (this.roles.findIndex(r => r.name === 'owner') !== -1) {
            this.permissions = AllPermissions;
            return;
        }
 
        const flattenPermissions = flatten(this.roles.map(r => r.permissions));
        const serverPermissions: IPermission[] = uniqBy(flattenPermissions, (p) => `${p.subject}-${p.action}`);

        this.permissions = AllPermissions.filter(p => {
            return serverPermissions.findIndex(perm =>
                perm.subject.toLowerCase() === p.subject.toLowerCase()
                && perm.action.toLowerCase() === p.action.toLowerCase()) !== -1;
        });
    }
}

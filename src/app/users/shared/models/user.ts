import { IPermission } from '../../../permissions/shared/models';

export interface IUserProfile {
    firstName: string;
    middleName?: string;
    lastName?: string;
    sex?: string;
    dob?: Date;
    // yojanier
    telephonNumber?: string;
}
// yojanier
export interface IUserNotifications {
    general: boolean;
    chat: boolean;
    emailNotification: boolean;
    dnd: boolean;
    }
export interface IUserEmail {
    address: string;
    verified: boolean;
}
export interface IUserPreference {
    chart?: any;
    // yojanier
    notifications?: IUserNotifications;
    }
export interface IManageUsers {
    _id: string;
    id: string;
    username: string;
    profile: IUserProfile;
    emails: IAddress[];
    roles: string[];
    timestamps?: string;
}

export interface IAddress {
    address: string;
}

export interface IRole {
    name: string;
    permissions: IPermission[];
}

export interface IUser {
    _id: string;
    userName: string;
    password?: string;
    emails?: IUserEmail;
    userPreference?: IUserPreference;
    userProfile?: IUserProfile;
    roles?: IRole[];
}
export interface IUserProfileData {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    general: boolean;
    chat: boolean;
    viaEmail: boolean;
    dnd: boolean;
}

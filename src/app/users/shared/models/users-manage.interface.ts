export interface AddEditUser {
    firstName: string;
    lastName: string;
    email: string;
    roles: any[];
    _id?: string;
}

export interface AdminState {
    name: string;
}

export interface InlineEdit {
    role: string;
    permission: string;
}
export interface PermissionAction {
    create: string;
    read: string;
    update: string;
    delete: string;
}
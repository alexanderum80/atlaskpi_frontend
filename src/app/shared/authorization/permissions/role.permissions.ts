import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const RoleSubject = 'role';

const actions = [
    ...CrudActions
];

export const RolePermissions: IPermission[] = actions.map(p => ({
    subject: RoleSubject,
    action: p
}));

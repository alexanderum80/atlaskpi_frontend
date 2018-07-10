import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const UserSubject = 'user';

const actions = [
    ...CrudActions
];

export const UserPermissions: IPermission[] = actions.map(p => ({
    subject: UserSubject,
    action: p
}));

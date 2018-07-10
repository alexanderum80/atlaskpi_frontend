import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const UserSubject = 'users';

const actions = [
    ...CrudActions,
    A.ManageAccessLevels
];

export const UserAccessLevelPermissions: IPermission[] = actions.map(p => ({
    subject: UserSubject,
    action: p
}));

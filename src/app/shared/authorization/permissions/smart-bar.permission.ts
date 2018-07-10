import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const SmartBarSubject = 'smartbar';

const actions = [
    A.View
];

export const SmartBarPermissions: IPermission[] = actions.map(p => ({
    subject: SmartBarSubject,
    action: p
}));

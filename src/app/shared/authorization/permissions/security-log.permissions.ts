import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models';

export const SecurityLogSubject = 'securitylog';

const actions = [
    A.View
];

export const SecurityLogPermissions: IPermission[] = actions.map(p => ({
    subject: SecurityLogSubject,
    action: p
}));

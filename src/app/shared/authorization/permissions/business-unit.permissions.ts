import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const BusinessUnitSubject = 'businessUnit';

const actions = [
    ...CrudActions,
    A.Manage
];

export const BusinessUnitPermissions: IPermission[] = actions.map(p => ({
    subject: BusinessUnitSubject,
    action: p
}));

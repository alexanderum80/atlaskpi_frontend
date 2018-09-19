import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models';

export const ConnectorSubject = 'connector';

const actions = [
    ...CrudActions,
    A.Manage
];

export const ConnectorPermissions: IPermission[] = actions.map(p => ({
    subject: ConnectorSubject,
    action: p
}));

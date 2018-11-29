import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models';

export const AlertsSubject = 'alerts';

const actions = [
    ...CrudActions
];

export const AlertsPermissions: IPermission[] = actions.map(p => ({
    subject: AlertsSubject,
    action: p
}));

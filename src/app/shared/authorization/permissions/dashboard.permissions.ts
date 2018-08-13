import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models';

export const DashboardSubject = 'dashboard';

const actions = [
    ...CrudActions
];

export const DashboardPermissions: IPermission[] = actions.map(p => ({
    subject: DashboardSubject,
    action: p
}));

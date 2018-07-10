import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const KpiSubject = 'kpi';

const actions = [
    ...CrudActions,
    A.Clone,
    A.Share,
    A.Manage
];

export const KpiPermissions: IPermission[] = actions.map(p => ({
    subject: KpiSubject,
    action: p
}));

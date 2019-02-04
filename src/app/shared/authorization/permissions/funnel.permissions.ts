import { ActionsMap as A, CrudActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models';

export const FunnelSubject = 'funnel';

const actions = [
    ...CrudActions
];

export const FunnelPermissions: IPermission[] = actions.map(p => ({
    subject: FunnelSubject,
    action: p
}));

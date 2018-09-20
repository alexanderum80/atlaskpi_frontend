import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models';

export const TargetSubject = 'target';

const actions = [
    ...CrudActions
];

export const TargetPermissions: IPermission[] = actions.map(p => ({
    subject: TargetSubject,
    action: p
}));

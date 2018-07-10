import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const TargetSubject = 'target';

const actions = [
    ...CrudActions
];

export const TargetPermissions: IPermission[] = actions.map(p => ({
    subject: TargetSubject,
    action: p
}));

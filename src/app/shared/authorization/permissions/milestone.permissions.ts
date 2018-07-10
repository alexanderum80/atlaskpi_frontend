import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const MilestoneSubject = 'milestone';

const actions = [
    ...CrudActions
];

export const MilestonePermissions: IPermission[] = actions.map(p => ({
    subject: MilestoneSubject,
    action: p
}));

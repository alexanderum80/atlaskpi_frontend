import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models';

export const ActivityFeedSubject = 'feed';

const actions = [
    A.Activity
];

export const ActivityPermissions: IPermission[] = actions.map(p => ({
    subject: ActivityFeedSubject,
    action: p
}));

import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const WidgetSubject = 'widget';

const actions = [
    ...CrudActions,
    A.Clone
];

export const WidgetPermissions: IPermission[] = actions.map(p => ({
    subject: WidgetSubject,
    action: p
}));

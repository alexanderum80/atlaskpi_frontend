import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const DepartmentSubject = 'department';

const actions = [
    ...CrudActions
];

export const DepartmentPermissions: IPermission[] = actions.map(p => ({
    subject: DepartmentSubject,
    action: p
}));

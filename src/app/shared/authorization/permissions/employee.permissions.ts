import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const EmployeeSubject = 'employee';

const actions = [
    ...CrudActions
];

export const EmployeePermissions: IPermission[] = actions.map(p => ({
    subject: EmployeeSubject,
    action: p
}));

import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const AppointmentSubject = 'appointment';

const actions = [
    A.View
];

export const AppointmentPermissions: IPermission[] = actions.map(p => ({
    subject: AppointmentSubject,
    action: p
}));

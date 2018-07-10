import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const LocationSubject = 'location';

const actions = [
    ...CrudActions
];

export const LocationPermissions: IPermission[] = actions.map(p => ({
    subject: LocationSubject,
    action: p
}));

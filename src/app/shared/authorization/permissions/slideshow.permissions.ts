import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const SlideshowSubject = 'slideshow';

const actions = [
    ...CrudActions
];

export const SlideshowPermissions: IPermission[] = actions.map(p => ({
    subject: SlideshowSubject,
    action: p
}));

import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models';

export const AtlasSheetsSubject = 'atlasSheets';

const actions = [
    A.View,
    A.UpdateData,
    A.ModifyShema,
    A.Delete,
    A.Create
];

export const AtlasSheetsPermissions: IPermission[] = actions.map(p => ({
    subject: AtlasSheetsSubject,
    action: p
}));


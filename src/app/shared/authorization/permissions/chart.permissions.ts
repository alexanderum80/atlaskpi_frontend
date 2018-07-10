import { ActionsMap as A, CrudActions, CommentActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models/index';

export const ChartSubject = 'chart';

const actions = [
    ...CrudActions,
    ...CommentActions,
    A.Clone,
    A.Share,
    A.List,
    A.ChangeSettingsOnFly,
    A.CompareOnFly,
    A.Download,
    A.SeeInfo
];

export const ChartPermissions: IPermission[] = actions.map(p => ({
    subject: ChartSubject,
    action: p
}));


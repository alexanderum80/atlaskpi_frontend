import { ActionsMap as A, DataEntryActions } from './actions.map';
import { IPermission } from '../../../permissions/shared/models';

export const DataEntrySubject = 'dataentry';

const actions = [
    ...DataEntryActions
];

export const DataEntryPermissions: IPermission[] = actions.map(p => ({
    subject: DataEntrySubject,
    action: p
}));

import { IUserInfo } from '../../../models/index';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';

export class ManageConnectorActivity extends BaseActivity implements IActivity {
    name = 'ManageConnectorActivity';

    private _permissions = getPermissions(SubjectEnum.connector, [ActionsMap.Manage]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}
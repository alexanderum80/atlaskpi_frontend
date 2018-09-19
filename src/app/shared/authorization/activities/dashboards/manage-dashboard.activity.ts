import { IUserInfo } from '../../../models';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';

export class ManageDashboardActivity extends BaseActivity implements IActivity {
    name = 'ManageDashboardctivity';

    private _permissions = getPermissions(SubjectEnum.dashboard, [ActionsMap.Manage]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

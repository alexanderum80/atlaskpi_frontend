import { IUserInfo } from '../../../models/index';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';

export class ManageTargetActivity extends BaseActivity implements IActivity {
    name = 'ManageTargetActivity';

    private _permissions = getPermissions(SubjectEnum.target, [ActionsMap.Manage]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

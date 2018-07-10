import { IUserInfo } from '../../../models/index';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';
import { Injectable } from '@angular/core';

@Injectable()
export class ViewSmartBarActivity extends BaseActivity implements IActivity {
    name = 'ViewSmartBarActivity';

    private _permissions = getPermissions(SubjectEnum.smartbar, [ActionsMap.View]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

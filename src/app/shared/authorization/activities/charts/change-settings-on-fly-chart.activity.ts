import { IUserInfo } from '../../../models';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';
import { Injectable } from '@angular/core';

@Injectable()
export class ChangeSettingsOnFlyActivity extends BaseActivity implements IActivity {
    name = 'ChangeSettingsOnFlyActivity';

    private _permissions = getPermissions(SubjectEnum.chart, [ActionsMap.ChangeSettingsOnFly]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

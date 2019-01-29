import { getPermissions } from '../../permissions/all-permissions';
import { Injectable } from '@angular/core';
import { IActivity } from '../../activity';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { BaseActivity } from '../base.activity';
import { ActionsMap } from '../../permissions/actions.map';
import { IUserInfo } from '../../../models';

@Injectable()
export class UpdateFunnelActivity extends BaseActivity implements IActivity {
    name = 'UpdateFunnelActivity';

    private _permissions = getPermissions(SubjectEnum.funnel, [ActionsMap.Modify]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

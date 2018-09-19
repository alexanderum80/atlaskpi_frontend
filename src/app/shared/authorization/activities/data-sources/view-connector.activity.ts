import { Injectable } from '@angular/core';
import { IUserInfo } from '../../../models';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';

@Injectable()
export class ViewConnectorActivity extends BaseActivity implements IActivity {
    name = 'ViewConnectorActivity';

    private _permissions = getPermissions(SubjectEnum.connector, [ActionsMap.View]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

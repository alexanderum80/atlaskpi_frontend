import { IUserInfo } from '../../../models/index';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';
import { Injectable } from '@angular/core';

@Injectable()
export class UpdateLocationActivity extends BaseActivity implements IActivity {
    name = 'UpdateLocationActivity';

    private _permissions = getPermissions(SubjectEnum.location, [ActionsMap.Modify]);

    check(user: IUserInfo): boolean {
        if (!user) {
            return false;
        }

        return this.hasAllPermissions(user, this._permissions);
    }
}

import { IUserInfo } from '../../../models';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';
import { Injectable } from '@angular/core';

@Injectable()
export class AddEmployeeActivity extends BaseActivity implements IActivity {
    name = 'AddEmployeeActivity';

    private _permissions = getPermissions(SubjectEnum.employee, [ActionsMap.Create]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

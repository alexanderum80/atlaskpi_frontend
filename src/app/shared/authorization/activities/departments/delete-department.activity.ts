import { IUserInfo } from '../../../models/index';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';
import { Injectable } from '@angular/core';

@Injectable()
export class DeleteDepartmentActivity extends BaseActivity implements IActivity {
    name = 'DeleteDepartmentActivity';

    private _permissions = getPermissions(SubjectEnum.department, [ActionsMap.Delete]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

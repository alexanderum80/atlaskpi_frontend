import { IUserInfo } from '../../../models';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';
import { Injectable } from '@angular/core';

@Injectable()
export class DeleteTargetActivity extends BaseActivity implements IActivity {
    name = 'DeleteTargetActivity';

    private _permissions = getPermissions(SubjectEnum.target, [ActionsMap.Delete]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

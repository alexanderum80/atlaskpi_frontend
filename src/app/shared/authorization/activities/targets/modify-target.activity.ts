import { Injectable } from '@angular/core';
import { IUserInfo } from '../../../models/index';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';

@Injectable()
export class ModifyTargetActivity extends BaseActivity implements IActivity {
    name = 'ModifyTargetActivity';

    private _permissions = getPermissions(SubjectEnum.target, [ActionsMap.Modify]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

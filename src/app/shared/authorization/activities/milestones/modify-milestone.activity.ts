import { Injectable } from '@angular/core';
import { IUserInfo } from '../../../models';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';

@Injectable()
export class ModifyMilestoneActivity extends BaseActivity implements IActivity {
    name = 'ModifyMilestoneActivity';

    private _permissions = getPermissions(SubjectEnum.milestone, [ActionsMap.Modify]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}


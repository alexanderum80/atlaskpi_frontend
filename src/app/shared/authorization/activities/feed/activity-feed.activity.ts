import { IUserInfo } from '../../../models/index';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { IActivity } from '../../activity';
import { BaseActivity } from '../base.activity';
import { getPermissions } from '../../permissions/all-permissions';
import { Injectable } from '@angular/core';

@Injectable()
export class ActivityFeedActivity extends BaseActivity implements IActivity {
    name = 'ActivityFeedActivity';

    private _permissions = getPermissions(SubjectEnum.feed, [ActionsMap.Activity]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

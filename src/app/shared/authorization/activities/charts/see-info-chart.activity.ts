import { IUserInfo } from '../../../models/index';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';
import { Injectable } from '@angular/core';

@Injectable()
export class SeeInfoActivity extends BaseActivity implements IActivity {
    name = 'SeeInfoActivity';

    private _permissions = getPermissions(SubjectEnum.chart, [ActionsMap.SeeInfo]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

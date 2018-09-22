import { Injectable } from '@angular/core';
import { IUserInfo } from '../../../models';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';

@Injectable()
export class CloneChartActivity extends BaseActivity implements IActivity {
    name = 'CloneChartActivity';

    private _permissions = getPermissions(SubjectEnum.chart, [ActionsMap.Clone]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

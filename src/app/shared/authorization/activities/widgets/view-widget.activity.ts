import { IUserInfo } from '../../../models/index';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';
import { Injectable } from '@angular/core';

@Injectable()
export class ViewWidgetActivity extends BaseActivity implements IActivity {
    name = 'ViewWidgetActivity';

    private _permissions = getPermissions(SubjectEnum.widget, [ActionsMap.View]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

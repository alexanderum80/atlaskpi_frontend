import { IUserInfo } from '../../../models/index';
import { IActivity } from '../../activity';
import { ActionsMap } from '../../permissions/actions.map';
import { SubjectEnum } from '../../permissions/all-permission-subjects';
import { getPermissions } from '../../permissions/all-permissions';
import { BaseActivity } from '../base.activity';
import { Injectable } from '@angular/core';

@Injectable()
export class DeleteBusinessUnitActivity extends BaseActivity implements IActivity {
    name = 'DeleteBusinessUnitActivity';

    private _permissions = getPermissions(SubjectEnum.businessUnit, [ActionsMap.Delete]);

    check(user: IUserInfo): boolean {
        return this.hasAllPermissions(user, this._permissions);
    }
}

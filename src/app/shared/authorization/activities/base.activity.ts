import { IRole } from '../../../roles/shared/role';
import { IActivity } from '../activity';
import { IPermission } from '../../../permissions/shared/models';
import { IUserInfo } from '../../models';
import { lowerCase } from 'change-case';

export abstract class BaseActivity {

    hasAllPermissions(user: IUserInfo, permissions: IPermission[]): boolean {
        if (!user) { return false; }

        const isOwner = user.roles.find(role => role.name === 'owner');
        if (isOwner) {
            return true;
        }

        if (!permissions.length) {
            console.error('permissions are empty');
            return;
        }

        const allow = user.roles.find((role: IRole) => {
            return role.permissions.find(permission => {
                return (lowerCase(permission.action) === lowerCase(permissions[0].action)) &&
                        (lowerCase(permission.subject) === lowerCase(permissions[0].subject));
            });
        });

        return allow ? true : false;
    }

}

import { IPermission } from '../../permissions/shared/models';
import { IUserInfo } from '../models';

export interface IActivity {
    name: string;
    description?: string;
    check(user: IUserInfo): boolean;
    checkAsync?(user: IUserInfo): Promise<boolean>;
}

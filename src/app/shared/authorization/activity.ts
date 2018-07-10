import { IPermission } from '../../permissions/shared/models/index';
import { IUserInfo } from '../models/index';

export interface IActivity {
    name: string;
    description?: string;
    check(user: IUserInfo): boolean;
    checkAsync?(user: IUserInfo): Promise<boolean>;
}

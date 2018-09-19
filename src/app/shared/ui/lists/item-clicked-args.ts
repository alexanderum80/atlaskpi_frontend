
import { IListItem } from './list-item';
import { MenuItem } from '../../../ng-material-components';

export interface IActionItemClickedArgs {
    item: IListItem;
    action: MenuItem;
}

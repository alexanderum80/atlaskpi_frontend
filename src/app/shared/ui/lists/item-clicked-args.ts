
import { IListItem } from './list-item';
import { MenuItem } from '../../../ng-material-components/index';

export interface IActionItemClickedArgs {
    item: IListItem;
    action: MenuItem;
}

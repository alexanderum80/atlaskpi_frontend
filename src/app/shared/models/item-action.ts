import { MenuItem } from '../../ng-material-components';

export class ItemAction<T> {
  action: MenuItem;
  item: T;

  constructor(obj: ItemAction<T> | any) {
        Object.assign(this, obj);
  }
}


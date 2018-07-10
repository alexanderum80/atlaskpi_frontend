import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { MenuItem } from '../models/menu-item.model';

@Injectable()
export class MenuService {
    private _activeClass: string;
    private _activeIcon: string;

    private _activeItem: Subject<MenuItem>;
    private _items: MenuItem[];
    private _item: MenuItem;

    constructor() {
        this._activeItem = new Subject<MenuItem>();
    }

    initialize(items: MenuItem[], activeClass: string, activeIcon: string) {
        this._items = items;
        this._activeClass = activeClass ;
        this._activeIcon = activeIcon;
    }

    get activeClass() {
        return this._activeClass ;
    }

    get activeItem$(): Observable<MenuItem> {
        return this._activeItem.asObservable();
    }

    get ActiveItem() {
      return this._item  ;
    }

    setActive(item: MenuItem) {
        if (!item) {
          item = this._items[0];
        }

        const itemFound = this._items.find(i => i.id === item.id );
        const selectedItem = this._items.find(i => i.active === item.active );

        if (!itemFound) {
          return;
        }

        if (selectedItem) {
            selectedItem.active = false;
        }

         if (this._activeIcon) {
             if (selectedItem) {
                selectedItem.icon = selectedItem.originalIcon;
             }

             item.originalIcon = item.icon;
             item.icon = this._activeIcon;
        }

        itemFound.active = true;
        this._activeItem.next(item);
        this._item = itemFound;
    }
}

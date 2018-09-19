import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MenuService } from '../services/menu.service';
import { MenuItem } from '../models/menu-item.model';

@Component({
  selector: 'kpi-dashboard-menu',
  templateUrl: './dashboard-menu.component.pug',
  styleUrls: ['./dashboard-menu.component.scss'],
  providers: [ MenuService ]
})
export class DashboardMenuComponent implements OnInit, OnDestroy {
  @Input() class: string;
  @Input() alt = false;
  @Input() items: MenuItem[] = [];
  @Input() activeClass = 'active';
  @Input() activeIcon = '';

  @Output() itemClicked = new EventEmitter<MenuItem>();

  private _activeItemSubscription: Subscription;

  constructor(private _service: MenuService) { }

  ngOnInit() {
      const that = this;
      this._activeItemSubscription = this._service.activeItem$.subscribe((item: MenuItem) => {
          that.itemClicked.emit(item);
      }) ;
      this._service.initialize(this.items, this.activeClass, this.activeIcon);

  }

  ngOnDestroy() {
      if (this._activeItemSubscription) { this._activeItemSubscription.unsubscribe(); }
  }
}

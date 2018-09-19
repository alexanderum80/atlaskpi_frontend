import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { MenuService } from '../services/menu.service';
import { MenuItem } from '../models/menu-item.model';

@Component({
  selector: 'kpi-dashboard-menu-item',
  templateUrl: './dashboard-menu-item.component.pug',
  styleUrls: ['./dashboard-menu-item.component.scss']
})
export class DashboardMenuItemComponent implements OnInit {
  @Input() alt: boolean;
  @Input() item: MenuItem;
  @Input() items: MenuItem;

  public expanded = false;
  public childrenDisplay: string;
  public activeClass: string;

  private _activeItemSubscription: Subscription;

  constructor(private _router: Router, private _menuService: MenuService) { }

  ngOnInit() {
      const that = this;

      this._activeItemSubscription = this._menuService.activeItem$.subscribe((item) => {
          that.activeClass = item.id === that.item.id ?
               that._menuService.activeClass : '';
      });
      this.itemSelect(null);
  }

  onItemClicked(e: any): void {
    e.preventDefault();
    this.itemSelect('click');
  }

  private itemSelect(e: any) {
    if (!this.item.children) {
      if (!e) {
        this._menuService.setActive(this.items[0]);
      } else {
        this._menuService.setActive(this.item);
      }
    }

    // when item contain childrens then forget about everything else
    // this may change in the futuro though
    if (this.item.children && this.item.children.length > 0) {
        this.expanded = !this.expanded;
        return;
    }

    if (this.item.route) {
        this._router.navigate([this.item.route]);
    } else if (this.item.url) {
        this._router.navigateByUrl(this.item.url);
    } else if (this.item.externalUrl) {
        window.open(this.item.externalUrl);
    }
  }

}

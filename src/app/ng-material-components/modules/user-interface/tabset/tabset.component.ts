import {Component, OnInit, OnDestroy, HostBinding, Input} from '@angular/core';
import {TabDirective} from './tab.directive';
// todo: add active event to tab
// todo: fix? mixing static and dynamic tabs position tabs in order of creation
@Component({
  selector: 'bw-tab-set',
  template: `
    <ul class="tab-nav tn-justified {{class}}" role="tablist" (click)="$event.preventDefault()"
      [ngClass]="classMap" [class.ts-alt]="alt">
      <li
        class="nav-item"
        *ngFor="let tabz of tabs"
        [class.active]="tabz.active"
        [class.disabled]="tabz.disabled"
        role="presentation">
          <a class="nav-link" href="" [class.active]="tabz.active"
            [class.disabled]="tabz.disabled" (click)="tabClicked(tabz)">
            <i class="zmdi zmdi-{{tabz.icon}}" *ngIf="tabz.icon" [ngClass]="{ 'icon-tab': iconTab }"></i>
            <div>
              <span [ngTransclude]="tabz.headingRef">{{tabz.heading}}</span>
            </div>
            <span *ngIf="tabz.removable">
              <span class="zmdi zmdi-close-circle" (click)="$event.preventDefault(); removeTab(tabz);"></span>
            </span>
          </a>
      </li>
    </ul>
    <div class="tab-content">
      <ng-content></ng-content>
    </div>
  `,
})
export class TabsetComponent implements OnDestroy {

  public classMap: any = {};

  @Input() public class: string;
  @Input()
  public get iconTab(): boolean { return this._iconTab; }
  @Input() public alt = false;

  @HostBinding('class.tab-container') protected clazz: boolean = true;

  public set iconTab(value: boolean) {
    this._iconTab = value;
    this.setClassMap();
  }

  public tabs: Array<TabDirective> = [];

  private isDestroyed: boolean;
  private _iconTab: boolean;

  public ngOnDestroy(): void {
    this.isDestroyed = true;
  }

  public tabClicked(tab: TabDirective) {
    tab.active = true;
  }

  public selectTab(index: number) {
    if (index < 1 || index > this.tabs.length) {
      console.error('Tab index out of range');
    }

    let tab = this.tabs[index - 1];
    setTimeout(function() {
      tab.active = true;
    }, 0);

  }

  public addTab(tab: TabDirective): void {
    this.tabs.push(tab);
    tab.active = this.tabs.length === 1 && tab.active !== false;
  }

  public removeTab(tab: TabDirective): void {
    let index = this.tabs.indexOf(tab);
    if (index === -1 || this.isDestroyed) {
      return;
    }
    // Select a new tab if the tab to be removed is selected and not destroyed
    if (tab.active && this.hasAvailableTabs(index)) {
      let newActiveIndex = this.getClosestTabIndex(index);
      this.tabs[newActiveIndex].active = true;
    }

    tab.removed.emit(tab);
    this.tabs.splice(index, 1);
  }

  private getClosestTabIndex(index: number): number {
    let tabsLength = this.tabs.length;
    if (!tabsLength) {
      return -1;
    }

    for (let step = 1; step <= tabsLength; step += 1) {
      let prevIndex = index - step;
      let nextIndex = index + step;
      if (this.tabs[prevIndex] && !this.tabs[prevIndex].disabled) {
        return prevIndex;
      }
      if (this.tabs[nextIndex] && !this.tabs[nextIndex].disabled) {
        return nextIndex;
      }
    }
    return -1;
  }

  private hasAvailableTabs(index: number): boolean {
    let tabsLength = this.tabs.length;
    if (!tabsLength) {
      return false;
    }

    for (let i = 0; i < tabsLength; i += 1) {
      if (!this.tabs[i].disabled && i !== index) {
        return true;
      }
    }
    return false;
  }

  private setClassMap(): void {
    this.classMap = {
      'tn-icon': this.iconTab,
    };
  }
}

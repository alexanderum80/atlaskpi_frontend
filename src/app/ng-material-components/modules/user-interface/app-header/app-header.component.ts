import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MenuItem } from '../../../models/menu-item';
import { Router } from '@angular/router';

@Component({
    selector: 'bw-app-header',
    template: `
        <header class="clearfix animated slideInDown {{class}}" id="header" [attr.data-current-skin]="color">
            <ul class="header-inner">
                <!-- menu trigger-->
                <li id="menu-trigger" [attr.data-trigger]="'#sidebar'" *ngIf="addMenuTrigger && !backActive"
                    [class.open]="sidebarOpen" (click)="toggleSidebar()">
                <div class="line-wrap">
                    <div class="line top"></div>
                    <div class="line center"></div>
                    <div class="line bottom"></div>
                </div>
                </li>
                <li id="menu-trigger" *ngIf="backActive" (click)="backActionClicked()" [class.open]="backActive">
                <div class="line-wrap">
                    <div class="line top"></div>
                    <div class="line center"></div>
                    <div class="line bottom"></div>
                </div>
                </li>
                <!-- brand-->
                <li class="logo" *ngIf="brand"><a [href]="logoHref">{{brand}}</a></li>
                <!-- logo-->
                <li *ngIf="brand === undefined && logoPath !== undefined">
                    <a class="m-l-10" [href]="logoHref"><img [src]="logoPath"/></a>
                </li>
                <li class="pull-right" *ngIf="actions">
                <bw-actions color="white" bwActionItems="actions" [showBig]="true"
                    (actionClicked)="headerActionClicked($event)"></bw-actions>
                </li>
            </ul>
            <!-- for extra content injection-->
            <ng-content></ng-content>
        </header>
    `,
})
export class AppHeaderComponent {
    @Input() public class: string;
    @Input() public color: string;
    @Input() public addMenuTrigger: boolean;
    @Input() public brand: string;
    @Input() public sidebarOpen: boolean = false;
    @Input() public actions: MenuItem[];
    @Input() public logoPath: string;
    @Input() public logoHref: string = '/';
    @Input() public backActive: boolean = false;

    @Output() private onSidebarToggle = new EventEmitter();
    @Output() private onActionClicked = new EventEmitter();
    @Output() private onbackActionClicked = new EventEmitter();

    constructor(private router: Router) { }

    public toggleSidebar(): void {
        this.sidebarOpen = !this.sidebarOpen;
        this.onSidebarToggle.emit(this.sidebarOpen);
    }

    public headerActionClicked(item: MenuItem) {
        this.onActionClicked.emit(item);
    }

    public backActionClicked() {
         this.onbackActionClicked.emit();
    }
}

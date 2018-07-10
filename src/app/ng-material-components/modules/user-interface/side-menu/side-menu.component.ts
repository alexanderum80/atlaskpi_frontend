import { Subscription } from 'rxjs/Subscription';
import { MenuService } from './menu.service';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from '../../../models/menu-item';

@Component({
    providers: [ MenuService ],
    selector: 'bw-side-menu',
    template: `
        <ul class="main-menu {{class}}">
            <bw-side-menu-item *ngFor="let item of items" [item]="item" [alt]="alt"></bw-side-menu-item>
        </ul>
    `,
})
export class SideMenuComponent implements OnInit, OnDestroy {
    @Input() public class: string;
    @Input() public alt = false;
    @Input() public items: MenuItem[];
    @Input() public activeClass = 'active';
    @Input() public activeIcon = '';

    @Output() private itemClicked = new EventEmitter<MenuItem>();

    private activeItemSubscription: Subscription;

    constructor(private service: MenuService) { }

    public ngOnInit() {
        const that = this;
        this.activeItemSubscription = this.service.activeItem$.subscribe((item) => {
            that.itemClicked.emit(item);
        });

        this.service.initialize(this.items, this.activeClass, this.activeIcon);
    }

    public ngOnDestroy() {
        this.activeItemSubscription.unsubscribe();
    }
}

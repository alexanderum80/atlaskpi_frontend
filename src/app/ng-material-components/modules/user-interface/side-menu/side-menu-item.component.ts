import { Subscription } from 'rxjs/Subscription';
import { MenuService } from './menu.service';
import {
    Component,
    OnInit,
    Input,
    // trigger,
    // state,
    // animate,
    // transition,
    // style
} from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from '../../../models/menu-item';

@Component({
    selector: 'bw-side-menu-item',
    template: `
        <li class="{{activeClass}}" [ngClass]="{ 'toggled': expanded, 'sub-menu': item.children }"
            (click)="onItemClicked($event)"><a href="" (click)="$event.preventDefault()"
            [class.fc-alt]="alt"><i class="zmdi zmdi-{{item.icon}}" *ngIf="item.icon"></i>{{item.title}}</a>
            <ul [class.hidden]="!expanded" *ngIf="item.children">
                <bw-side-menu-item [item]="child" *ngFor="let child of item.children"></bw-side-menu-item>
            </ul>
        </li>
    `,
    // animations: [
    //     trigger('isVisibleChanged', [
    //         state('true', style({ opacity: 1 })),
    //         state('false', style({ opacity: 0, height: 0 })),
    //         transition('* => *', animate('.2s')),
    //     ]),
    // ],
})
export class SideMenuItemComponent implements OnInit {
    @Input() public alt: boolean;
    @Input() public item: MenuItem;

    public expanded: boolean = false;
    public childrenDisplay: string;
    public activeClass: string;

    private activeItemSubscription: Subscription;

    constructor(private router: Router, private menuService: MenuService) { }

    public ngOnInit() {
        const that = this;
        this.activeItemSubscription = this.menuService.activeItem$.subscribe((item) => {
            that.activeClass = item.id === that.item.id ?
                 that.menuService.activeClass : '';
        });
    }

    public onItemClicked(e: any): void {
        e.preventDefault();

        if (!this.item.children) {
            this.menuService.setActive(this.item);
        }

        // when item contain childrens then forget about everything else
        // this may change in the futuro though
        if (this.item.children && this.item.children.length > 0) {
            this.expanded = !this.expanded;
            // show/hide children items
            // this.childrenDisplay = this.expanded ? 'block' : 'none';
            return;
        }

        if (this.item.route) {
            this.router.navigate([this.item.route]);
        } else if (this.item.url) {
            this.router.navigateByUrl(this.item.url);
        } else if (this.item.externalUrl) {
            window.open(this.item.externalUrl);
        }
    }

}

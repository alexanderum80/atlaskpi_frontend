import { forEach } from 'lodash';
import { Directive, ElementRef, Input, Renderer, AfterViewInit, HostListener, OnChanges } from '@angular/core';
import { MenuItem } from '../../../models/menu-item';
import { ActionsService } from './actions.service';

@Directive({ selector: '[bwActionItem]' })
export class ActionItemDirective implements AfterViewInit, OnChanges {

    @Input() public bwActionItem: MenuItem;
    @Input() public color;
    @Input() public iconColor;

    constructor(private el: ElementRef, private renderer: Renderer, private actionsService: ActionsService) { }

    public ngAfterViewInit() {
        if (!this.iconColor) {
            this.renderer.setElementStyle(this.el.nativeElement.parentElement, 'color', this.color);
        }
        // add anchor
        this._createAnchor(this.el.nativeElement, this.bwActionItem);
    }

    public ngOnChanges() {
        if (!this.iconColor) {
            this.renderer.setElementStyle(this.el.nativeElement.parentElement, 'color', this.color);
        } else {
            this.changeElementcolor(this.el.nativeElement);
        }
    }
    changeElementcolor(el: any) {
        this.renderer.setElementStyle(el, 'color', this.iconColor);
        if (el.children.length > 0) {
            for ( let cc = 0; cc < el.children.length; cc++) {
                this.changeElementcolor(el.children[cc]);
            }
        }
    }
    @HostListener('click', ['$event'])
    public onActionClicked($event: MouseEvent, menuItem?: MenuItem): void {
        $event.preventDefault();

        menuItem = menuItem || this.bwActionItem;

        if (!menuItem || (menuItem.hasOwnProperty('active') && menuItem.active === false)) {
            return;
        }

        const item: MenuItem = menuItem ? menuItem : this.bwActionItem;

        // only send notification when the item does not have children
        if (!item.children) {
            this.actionsService.announceAction(item);
        }
    }

    private _createAnchor(ele: any, menuItem: MenuItem, submenu: boolean = false) {
        const anchor = this.renderer.createElement(ele, 'a');
        this.renderer.setElementAttribute(anchor, 'href', '');
        if (this.iconColor && !submenu) {
            this.renderer.setElementStyle(anchor, 'color', this.iconColor);
        }
        if (this._isObject(menuItem) && menuItem.hasOwnProperty('disabled') && menuItem.disabled) {
            this.renderer.setElementClass(anchor, 'pointer-events-none', true);
        }

        if (submenu) {
            this.renderer.listen(anchor, 'click', (event: MouseEvent) => {
                this.onActionClicked(event, menuItem);
            });
        }

        // add icon if it was provided
        const icon = menuItem.icon;

        if (icon) {
            const i = this.renderer.createElement(anchor, 'i');

            this.renderer.setElementClass(i, 'zmdi', true);
            this.renderer.setElementClass(i, `zmdi-${icon}`, true);
            if (this.iconColor && !submenu) {
                 this.renderer.setElementStyle(i, 'color', this.iconColor);
            }
            if (this.actionsService.showBig) {
                this.renderer.setElementClass(i, 'tm-icon', true);
            }
        }

        // add title if it was provided
        const title = menuItem.title;

        if (title) {
            this.renderer.createText(anchor, title);
        }

        if (menuItem.children) {
            // add dropwn class
            this.renderer.setElementClass(ele, 'dropdown', true);
            this.renderer.setElementAttribute(ele, 'data-toggle', 'dropdown');

            const ul = this.renderer.createElement(ele, 'ul');
            this.renderer.setElementClass(ul, 'dropdown-menu', true);
            this.renderer.setElementClass(ul, 'dm-icon', true);
            this.renderer.setElementClass(ul, 'dropdown-menu-right', true);
            this.renderer.setElementClass(ul, 'overflow-auto', true);

            if (!this.bwActionItem || !this.bwActionItem.children) {
                return;
            }

            this.bwActionItem.children.forEach((item: MenuItem) => {
                const li = this.renderer.createElement(ul, 'li');
                if (item.disabled) {
                    this.renderer.setElementClass(li, 'disabled', true);
                }
                this._createAnchor(li, item, true);
            });
        }
    }

    private _isObject(value: any) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

}

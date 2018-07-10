import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';

import { MenuItem } from '../../../../ng-material-components';
import { IActionItemClickedArgs } from '../item-clicked-args';
import { IListItem } from '../list-item';
import { isEmpty, isBoolean } from 'lodash';
import { VisibleActionItemHelper } from '../../../helpers/visible-action-item.helper';

@Component({
    selector: 'kpi-list-item-standard',
    templateUrl: './list-item-standard.component.pug',
    styleUrls: ['./list-item-standard.component.scss']
})
export class ListItemStandardComponent implements OnInit {

    @Input() item: IListItem;
    @Input() actionItems: MenuItem[];
    @Input() itemClickable = false;
    @Input() standardItemTemplate: TemplateRef<any>;

    @Output() actionClicked = new EventEmitter < IActionItemClickedArgs > ();

    hover = false;

    constructor(private _router: Router) {}

    ngOnInit() {
        this._updateVisibleActionItem();
    }

    onMouseOver(e) {
        this.hover = true;
    }

    onMouseOut(e) {
        this.hover = false;
    }

    onActionClicked(actionItem: MenuItem) {
        this.actionClicked.emit({
            action: actionItem,
            item: this.item
        });
    }

    private _updateVisibleActionItem(): void {
        if (VisibleActionItemHelper && VisibleActionItemHelper.updateActionItem) {
            VisibleActionItemHelper.updateActionItem(this._router.url, this.item, this.actionItems);
        }
    }
}

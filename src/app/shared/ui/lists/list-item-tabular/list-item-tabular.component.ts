import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';

import { MenuItem } from '../../../../dashboards/shared/models';
import { IActionItemClickedArgs } from '../item-clicked-args';
import { IListItem } from '../list-item';
import {VisibleActionItemHelper} from '../../../helpers/visible-action-item.helper';
import { BrowserService } from '../../../services/browser.service';

@Component({
    selector: 'kpi-list-item-tabular',
    templateUrl: './list-item-tabular.component.pug',
    styleUrls: ['./list-item-tabular.component.scss']
})
export class ListItemTabularComponent implements OnInit {
    isMobile: boolean;
    @Input() item: IListItem;
    @Input() actionItems: MenuItem[];
    @Input() itemClickable = false;
    @Input() tableRowTemplate: TemplateRef<any>;
    @Input() rowCount: boolean;

    @Output() actionClicked = new EventEmitter < IActionItemClickedArgs > ();

    constructor(private _router: Router, private _browser: BrowserService) {
        this.isMobile = this._browser.isMobile();
    }

    ngOnInit() {
        this._updateVisibleActionItem();
    }

    onActionClicked(actionItem: MenuItem) {
        this.actionClicked.emit({
            action: actionItem,
            item: this.item
        });
    }
    get colorRow() {
        return this.rowCount;
    }
    private _updateVisibleActionItem(): void {
        if (VisibleActionItemHelper && VisibleActionItemHelper.updateActionItem) {
            VisibleActionItemHelper.updateActionItem(this._router.url, this.item, this.actionItems);
        }
    }

}

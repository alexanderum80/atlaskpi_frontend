import { CommonService } from '../../../services/common.service';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { find } from 'lodash';
import { MenuItem } from '../../../../dashboards/shared/models';
import { IActionItemClickedArgs } from '../item-clicked-args';
import { IListItem, IOrderField } from '../list-item';
import { IItemListActivityName } from '../../../interfaces/item-list-activity-names.interface';
import { getEnumString } from '../../../extentions';
import { flatten, isEmpty } from 'lodash';
import { Subscription } from 'rxjs/Subscription';
import SweetAlert from 'sweetalert2';
import { lowerCaseFirst } from 'change-case';

export interface ISearchArgs {
    search: string;
}

enum ItemActionEnum {
    Edit = 1,
    Delete = 2,
    Visible = 3
}

@Component({
    selector: 'kpi-item-list',
    templateUrl: './item-list.component.pug',
    styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit, OnDestroy {
    @Input() allowAdd = true;

    @Input() itemViewModel?: any;
    @Input() addItemActivityName?: string;
    @Input() itemListActivityName?: IItemListActivityName;

    @Input() title: string;
    @Input()
    set items(items: IListItem[]) {
        this._items = items;

        const searchArgs = this.fg ? this.fg.value : null;
        this._filterItems(searchArgs);
    }
    @Input() itemType: 'standard' | 'small' | 'big' | 'table' = 'standard';
    @Input() actionItems: MenuItem[] = [{
        id: 'more-options',
        icon: 'more-vert',
        children: [{
                id: getEnumString(ItemActionEnum, ItemActionEnum.Edit).toLocaleLowerCase(),
                title: getEnumString(ItemActionEnum, ItemActionEnum.Edit),
                icon: 'edit'
            },
            {
                id: getEnumString(ItemActionEnum, ItemActionEnum.Delete).toLocaleLowerCase(),
                title: getEnumString(ItemActionEnum, ItemActionEnum.Delete),
                icon: 'delete'
            }
        ]
    }];

    viewItems: MenuItem[] = [{
        id: 'more-options',
        icon: 'view-comfy',
        children: [{
                id: 'standard',
                title: 'Standard',
                icon: 'view-module'
            },
            {
                id: 'table',
                title: 'Table View',
                icon: 'view-list'
            }
        ]
    }];
    orderList: IOrderField[] = [{
        fieldName: '1',
        fieldValue: 1,
        descripcion: 'valor'},
        {
            fieldName: '2',
            fieldValue: 2,
            descripcion: 'fiesta'
    }];

    readonly blackListClassName = ['zmdi zmdi-more-vert', 'dropdown-backdrop'];
    readonly blackListNodeName = ['kpi-list-item-standard', 'kpi-list-item-tabular'];

    // responsive input
    @Input() xsSize = 100;
    @Input() smSize = 25;
    @Input() xlSize = 20;
    @Input() gtxsSize = 35;

    // custom templates
    @Input() tableRowTemplate: TemplateRef<any>;
    @Input() standardItemTemplate: TemplateRef<any>;

    @Output() onAddActionClicked = new EventEmitter();
    @Output() onItemClicked = new EventEmitter<any>();
    @Output() onItemActionClicked = new EventEmitter<IActionItemClickedArgs>();
    @Output() onSearchTermsUpdated = new EventEmitter<ISearchArgs>();

    public fg: FormGroup;

    private _items: IListItem[];
    private _filteredItems: IListItem[];
    private _subscription: Subscription[] = [];
    itemListVisible = false;

    ngOnInit() {
        this.fg = new FormGroup({
            search: new FormControl(null)
        });

        this._subscription.push(this.fg.valueChanges.subscribe(values => this._filterItems(values)));
        this._initializePermissions();
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    get filteredItems(): IListItem[] {
        return this._filteredItems;
    }

    get showStandardItems(): boolean {
        return this.itemType === 'standard';
    }

    get showSmallItems(): boolean {
        return this.itemType === 'small';
    }

    get showBigItems(): boolean {
        return this.itemType === 'big';
    }

    get showTabularItems(): boolean {
        return this.itemType === 'table';
    }

    //add-createdby
    get orderListGet(): IOrderField[] {
        const listOrder: IOrderField[] = [];
        this._items.forEach(function(a) {
            const temp = a.orderFields;
            temp.forEach(function(b) {
                let cant = 0;
                if (b.fieldName) {
                    for (let i = 0; i < listOrder.length; i++) {
                        if (b.fieldName === listOrder[i].fieldName ) {
                            cant++;
                        }
                    }
                    if (cant === 0) {
                        listOrder.push(b);
                    }
                }

            });

        });
        return listOrder;
    }

    orderAscBy(value: any) {
        this._items.sort(function (a , b) {
            for (let i = 0; i < a.orderFields.length; i++) {
                if (a.orderFields[i].fieldName === value && a.orderFields[i].fieldValue && b.orderFields[i].fieldValue) {
                    return a.orderFields[i].fieldValue - b.orderFields[i].fieldValue;
                }
            }
        });
        this.itemListVisible = false;
    }
    orderDescBy(value: any) {
        this._items.sort(function (a , b) {
            for (let i = 0; i < a.orderFields.length; i++) {
                if (a.orderFields[i].fieldName === value && a.orderFields[i].fieldValue && b.orderFields[i].fieldValue) {
                    return b.orderFields[i].fieldValue - a.orderFields[i].fieldValue;
                }
            }
        });
        this.itemListVisible = false;
    }
    public showOrderButtons() {
        return this.itemListVisible = true;
    }

    ////fin

    addClicked() {
        this.onAddActionClicked.emit();
    }

    itemClicked(e, item: IActionItemClickedArgs) {
        if (this._blackListItemClicked(e)) {
            return;
        }

        if (!this._allowToEdit()) {
            SweetAlert({
                type: 'info',
                text: `Sorry, you do not have permission to edit ${lowerCaseFirst(this.title)}`
            });
            return;
        }

        this.onItemClicked.emit({ item: item, itemType: this.itemType });
    }

    itemActionClicked(item: IActionItemClickedArgs) {
        this.onItemActionClicked.emit(item);
    }

    onViewItem(item: MenuItem) {
        const items = this.viewItems[0].children;

        switch (item.id) {
            // standard
            case items[0].id:
                this.itemType = 'standard';
                break;
            // table
            case items[1].id:
                this.itemType = 'table';
                break;
        }
    }

    /**
     * blackListClassName: user click more-vert, but tagName is 'I' in mobile, not 'A'
     * blackListNodeName: since item-list has padding. where there is padding is clickable
     * @param e
     */
    private _blackListItemClicked(e): boolean {
        return e.target.tagName === 'A' || this._blackListClassNameClicked(e) || this._blackListNodeNameClicked(e);
    }

    private _blackListClassNameClicked(e): boolean {
        return this.blackListClassName.indexOf(e.target.className) !== -1;
    }

    private _blackListNodeNameClicked(e): boolean {
        return this.blackListNodeName.indexOf(e.target.nodeName.toLowerCase()) !== -1;
    }

    private _allowToEdit(): boolean {
        if (this._childrenMenuItemsNotExist()) {
            return true;
        }
        const children: MenuItem[] = this.actionItems[0].children;

        if (isEmpty(children)) {
            return true;
        }

        const actionEdit: string = getEnumString(ItemActionEnum, ItemActionEnum.Edit).toLocaleLowerCase();
        const childActionItem: MenuItem = children.find(item => item.id === actionEdit);

        if (!childActionItem) {
            return true;
        }

        const canEdit: boolean = childActionItem.disabled;
        return !canEdit;
    }

    private _childrenMenuItemsNotExist(): boolean {
        return !Array.isArray(this.actionItems) || isEmpty(this.actionItems[0].children);
    }

    private _filterItems(args: ISearchArgs) {
        if (!args || !args.search) {
            return this._filteredItems = this._items;
        }

        this._filteredItems = this._items.filter(k =>
            k.title.toLowerCase().indexOf(args.search.toLowerCase()) !== -1);
    }

    // lets set the state of the actions if we can find a viewmodel and activities matching the actions id
    private _initializePermissions() {
        const hasActivities = Boolean(this.itemListActivityName && Object.keys(this.itemListActivityName).length);
        if (!this.itemViewModel && !hasActivities) { return; }

        const actionItems = flatten(this.actionItems.map(ai => ai.children));
        for (const k of Object.keys(this.itemListActivityName)) {

            // let the the actionItem based on the itemListActivity object key
            const actionItem = actionItems.find(i => i.id === k);
            if (actionItem) {
                actionItem.disabled = !this.itemViewModel.authorizedTo(this.itemListActivityName[k]);
            }
        }
    }
}

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
import { ApolloService } from '../../../../shared/services/apollo.service';
import { IMenuItem } from '../../../models';
import { BrowserService } from '../../../services/browser.service';

const updateUserPreference = require('graphql-tag/loader!./update-user-preference.mutation.gql');

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
    isMobile: boolean;
    constructor( private _apolloService: ApolloService, private _browser: BrowserService ) {
        this.isMobile = this._browser.isMobile();
    }

    @Input() allowAdd = true;
    @Input() titleRow = false;

    @Input() itemViewModel?: any;
    @Input() addItemActivityName?: string;
    @Input() itemListActivityName?: IItemListActivityName;

    @Input() title: string;
    @Input() aliases: string;
    @Input()
    set items(items: IListItem[]) {
        this._items = items;

        const searchArgs = this.fg ? this.fg.value : null;
        this._filterItems(searchArgs);
        const orders = this.orderListGet;
        if (orders && orders.length > 0) {
            const childrensort: MenuItem[] = [];
            for (let i = 0; i < orders.length; i++) {
                const childAsc = {
                    id: orders[i].fieldName + 'ASC',
                    icon: 'long-arrow-up',
                    title: orders[i].descripcion.toUpperCase() + ' ASC'
                };
                const childDesc = {
                    id: orders[i].fieldName + 'DESC',
                    icon: 'long-arrow-down',
                    title: orders[i].descripcion.toUpperCase() + ' DESC'
                };
                childrensort.push(childAsc);
                childrensort.push(childDesc);
            }
            this.sortItems[0].children = childrensort;
        }
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
    sortItems: MenuItem[] = [{
        id: 'order-options',
        icon: 'sort-amount-asc',
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
    private _sortChildrens: IMenuItem[] = [];

    rowColor = true;
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
    get rowsCount(): boolean {

        this.rowColor = this.rowColor ? false : true;
        return this.rowColor;
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

    // add-createdby
    get orderListGet(): IOrderField[] {
        const listOrder: IOrderField[] = [];
        const items = this._items;

        if(!items) return ;
        
        for ( let i = 0; i < items.length; i ++) {
            if (items[i].orderFields && items[i].orderFields.length > 0) {
                const temp = items[i].orderFields;
                for (let j = 0; j < temp.length; j++) {
                    let flag = false;
                    for (let k = 0; k < listOrder.length; k++) {
                        if (temp[j].fieldName === listOrder[k].fieldName) {
                            flag = true;
                        }
                    }
                    if (!flag) {
                        listOrder.push(temp[j]);
                    }
                }
            }

        }

        return listOrder;
    }

    get sortChildrenList(): IMenuItem[] {
        return this._sortChildrens;
    }
    get sortItemsLength(): boolean {
        const val = this.sortItems[0].children ? this.sortItems[0].children.length : 0;
        return  val > 0 ? true : false;
    }
    orderAscBy(value: any) {
        this._items.sort(function (a , b) {
            for (let i = 0; i < a.orderFields.length; i++) {
                if (a.orderFields[i].fieldName === value && b.orderFields[i].fieldName === value &&
                    a.orderFields[i].fieldValue && b.orderFields[i].fieldValue) {
                        if ( a.orderFields[i].fieldValue > b.orderFields[i].fieldValue ) {
                            return 1;
                        } else if (a.orderFields[i].fieldValue < b.orderFields[i].fieldValue) {
                            return -1;
                        }
                     return 0;
                }
            }
        });
    }
    orderDescBy(value: any) {
        this._items.sort(function (a , b) {
            for (let i = 0; i < a.orderFields.length; i++) {
                if (a.orderFields[i].fieldName === value && b.orderFields[i].fieldName === value &&
                    a.orderFields[i].fieldValue && b.orderFields[i].fieldValue ) {
                        if ( b.orderFields[i].fieldValue > a.orderFields[i].fieldValue ) {
                            return 1;
                        } else if (b.orderFields[i].fieldValue < a.orderFields[i].fieldValue) {
                            return -1;
                        }
                     return 0;
                }
            }
        });
    }
    onOrderList(item: MenuItem) {
        const items = this.sortItems[0].children;
        for (let i = 0; i < items.length; i++) {
            if (item.id === items[i].id) {
                const leng = item.id.length;
                if (item.id.includes('ASC')) {
                    const asc = item.id.substr(0, leng - 3);
                    this.orderAscBy(asc);
                }
                if (item.id.includes('DESC')) {
                    const asc = item.id.substr(0, leng - 4);
                    this.orderDescBy(asc);
                }
            }
        }
    }

    //// fin

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
                this.updatePreferences(this.itemType);
                break;
            // table
            case items[1].id:
                this.itemType = 'table';
                this.updatePreferences(this.itemType);
                break;
        }
    }

    private updatePreferences(itemTypeValue: string) {
        if (!itemTypeValue) { return; }

        const that = this;
        const currentItemType = (itemTypeValue === 'standard') ? 'standardView' : 'tableView';
        this._subscription.push(
            that._apolloService.mutation < {
            updateUserPreference: {
                success
            }
            } > (updateUserPreference, {
                id: this.itemViewModel._user._id,
                input: {[this.aliases.toLowerCase()]: { listMode: currentItemType }}
            })
            .then(result => {
                const response = result;
                    if (response.data.updateUserPreference.success === true) {
                      }
            })
        );
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

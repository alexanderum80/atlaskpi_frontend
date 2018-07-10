import { NgControl } from '@angular/forms';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    ViewChild,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { isArray } from 'util';
import { isNull, isUndefined, isString, isBoolean, uniqBy } from 'lodash';

import { SubmitableFormGroup } from '../../../models';
import { SelectionItem } from '../../../models/selection-item';
import { InputBase } from '../input-base/input-base.component';
import { processPolyfills } from './polyfills';
import { MouseEvent } from '@agm/core/services/google-maps-types';
import { ISelectableItem } from '../../../../shared/models/index';
import { ScrollEvent } from 'ngx-scroll-event';

/* tslint:disable */
declare var $: any;

processPolyfills();

@Component({
    selector: 'bw-select-picker',
    templateUrl: './select-picker.template.pug',
})
export class SelectPickerComponent extends InputBase implements OnChanges, OnDestroy, AfterViewInit {

    @Input() public fg: SubmitableFormGroup;
    @Input() public field: string;
    @Input() public label: string;
    @Input() public value: string;
    @Input() public disabled: boolean;
    @Input() public placeholder: string;
    @Input() public alt: boolean;
    @Input() public leftIcon: string;
    @Input() public rightIcon: string;
    @Input() public dependOnField: string;
    @Input() public required: boolean;
    @Input() public rememberLastValue = true;
    @Input() public filterControl: string;

    // options
    @Input() public items: SelectionItem[];
    @Input() public multiple: boolean = false;
    @Input() public autofocus: boolean = false;

    @Input() public noneSelectedText: string = 'Nothing selected';
    @Input() public noneResultsText: string = 'No results matched ';
    // @Input() public multipleSeparator: string = '| ';
    @Input() public liveSearch: boolean = false;
    @Input() public liveSearchPlaceholder: string | null = null;
    @Input() public liveSearchStyle: string = 'contains'; // or startsWith
    @Input() public maxOptions: number = 100;
    @Input() public isMobile: boolean = false;
    @Input() public tickIcon: string = 'zmdi-check';
    @Input() public valueSeparator: string = '|';
    @Input() public pageSize = 75;
    

    @Output() public dependantValueChanged = new EventEmitter < string > ();
    @Output() public filterControlQueryChanged = new EventEmitter<string>();


    // @Input() selectAllText: string = 'Select All';
    // @Input() deselectAllText: string = 'Deselect All';
    // @Input() doneButton: boolean = false;
    // @Input() doneButtonText: string = 'Close';
    // @Input() styleBase: string = 'btn';
    // @Input() style: string = 'btn-default';
    // @Input() size: string | number = 'auto';
    // @Input() title: string = null;
    // @Input() selectedTextFormat: string = 'values';
    // @Input() width: string = null;
    // // @Input() container: JQuery = null;
    // @Input() hideDisabled: boolean = false;
    // @Input() showSubtext: boolean = false;
    // @Input() showIcon: boolean = true;
    // @Input() showContent: boolean = true;
    // @Input() dropupAuto: boolean = true;
    // @Input() header: string = null;
    // @Input() liveSearchNormalize: boolean = false;
    // @Input() actionsBox: boolean = false;
    // @Input() iconBase: string = 'zmdi';
    // @Input() showTick: boolean = false;
    // @Input() template: any = {
    //     caret: '<span class="caret"></span>',
    // };
    // @Input() selectOnTab: boolean = false;
    // @Input() dropdownAlignRight: boolean | string = false;

    @ViewChild('inputGroup') inputGroup: ElementRef;
    @ViewChild('selectButton') selectButton: ElementRef;
    @ViewChild('filterOption') filterOption: ElementRef;

        
    open: boolean = false;
    filteredItems: SelectionItem[];
    selectedItems: SelectionItem[] = [];
    selection = this.noneSelectedText;
    query: FormControl;
    selectionWidth: number;

    _markForReset: boolean = false;

    private _clonedItems: SelectionItem[];
    private _dependOnFieldSubscription: Subscription;
    private _querySubscription: Subscription[] = [];
    private _valueChangeSubscription: Subscription;
    private _lastValue: any;
    private _valueChangedFromInside = false;
    private _resultsUpIndex: number;
    private _resultsDownIndex: number; 

    private _resizeSelectionWidth: any;

    // @Input() countSelectedText: Function = (numSelected: number, numTotal: number) => {
    //     return (numSelected === 1) ? '{0} item selected' : '{0} items selected';
    // };
    // @Input() maxOptionsText: Function = (numAll: number, numGroup: number) => {
    //     return [
    //         (numAll === 1) ? 'Limit reached ({n} item max)' : 'Limit reached ({n} items max)',
    //         (numGroup === 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)',
    //     ];
    // };

    constructor(private el: ElementRef, private _cdr: ChangeDetectorRef) {
        super(el);

        // need to set it up here because ngOnChanges happens before ngOnInit and I leave it in on init to make sure they are set back everytime on init is executed
        this._resultsUpIndex = 0;
        this._resultsDownIndex = this.pageSize;
    }

    @HostListener('window:resize', ['$event.target']) 
    onResize() {
        this._updateSelectionWidth();
    }

    @HostListener('body:click', ['$event.target']) 
    bodyClicked(e) {
            if (e 
            && e.classList 
            && ( e.classList.value.indexOf('filter-option') !== -1 || e.classList.value.indexOf('select-picker-filter-text') !== -1)) {
            return;
        }

        if (this.open) {
            this.toggleOpen();
        }
    }

    public ngOnInit(): void {
        const that = this;

        // set the initial boundary for result set
        this._resultsUpIndex = 0;
        this._resultsDownIndex = this.pageSize;

        if (this.required) {
            this.validations.push({
                message: 'This field is required',
                type: 'required',
                validator: Validators.required,
            });
        }

        this.query = new FormControl();

        // watch filter changes
        this._querySubscription.push(this.query.valueChanges
            .debounceTime(500)
            .subscribe(filter => {
            that._filterResults(filter);
        }));

        // watch value changes
        this._valueChangeSubscription = this.control.valueChanges.subscribe(data => {
            let newValue = data;

            if (data && that.rememberLastValue) {
                this._lastValue = data;
            }
            if (!data && that.rememberLastValue && !that._valueChangedFromInside) {
                newValue = this._lastValue;
            }

            that._updateSelection(newValue);

            that._valueChangedFromInside = false;
        });

        // if this control depend on another field then listen for changes on it
        if (this.dependOnField) {
                        
            const formField = this.fg.get(this.dependOnField);

            if (formField) {
                this._dependOnFieldSubscription = formField.valueChanges
                    .subscribe(v => {
                        if (that._ismarkForReset(v)) {
                            that._markForReset = true;
                        }
                        that.dependantValueChanged.emit(v);
                    });
            }
        }
        
        this._filterControlQuery();
    }

    ngOnDestroy() {
        if (this._dependOnFieldSubscription) this._dependOnFieldSubscription.unsubscribe();
        if (this._querySubscription && this._querySubscription.length) {
            this._querySubscription.forEach(q => q.unsubscribe());
        }
        if (this._valueChangeSubscription) this._valueChangeSubscription.unsubscribe();
    }

    ngOnChanges(changes: {
        [propertyName: string]: any
    }) {
        this.onInit();

        let that = this;

        if (changes['items']) {
            let clone: SelectionItem[] = [];

            let newItemList = changes['items'].currentValue;
            if (newItemList instanceof Array) {
                clone = newItemList.map((item: SelectionItem) => {
                    return {
                        id: item.id,
                        title: item.title,
                        disabled: item.disabled,
                        selected: item.selected,
                    };
                });
            }

            that._clonedItems = clone;
            this._updateSelection(this.control.value);
        }
    }

    ngAfterViewInit() {
        // set the right width for filter option
        this._updateSelectionWidth();
    }

    handleScroll(event: ScrollEvent) {
        // console.log('scroll occurred', event.originalEvent);
        if (event.isReachingBottom && this._resultsDownIndex < this._clonedItems.length) {
            console.log(`the user is reaching the bottom`);
            this._resultsUpIndex += this.pageSize;
            this._resultsDownIndex += this.pageSize * 2;
            this._filterResults(this.query.value);
        }
        if (event.isReachingTop && this._resultsUpIndex > 0) {
            this._resultsUpIndex -= this.pageSize * 2;
            this._resultsDownIndex -= this.pageSize;
            this._filterResults(this.query.value);
        }
        if (event.isWindowEvent) {
          console.log(`This event is fired on Window not on an element.`);
        }
     
      }

    get requiredSymbol(): string {
        const errors: any = this.control.validator && this.control.validator(new FormControl());
        const required = errors !== null && errors.required;

        return required ? '* ' : '';
    }

    get emptySearch(): boolean {
        const isFilterItemsEmpty = this.filteredItems === undefined || this.filteredItems.length === 0;

        if (this.multiple) {
            // not show noneResultsText value (no results matched) when all is selected in multi-selector
            if (this._clonedItems.length === this.selectedItems.length) {
                return false;
            }
        }
        return isFilterItemsEmpty;
    }

    set markForReset(value: boolean) {
        if (!isBoolean(value)) { return; }
        this._markForReset = value;
    }

    toggleOpen() {
        this.open = !this.open;
    }

    toggleItem(e, item: SelectionItem) {
        e.stopPropagation();

        this._valueChangedFromInside = true;
        item.selected = !item.selected;

        this._updateSelectedItems(item);

        if (!this.multiple) {
            this.toggleOpen();
            this._clonedItems.forEach(i => {
                if (item !== i) {
                    i.selected = false;
                }
            });

            if (item.selected) {
                this.control.setValue(item.id);
            } else {
                this.control.setValue(null);
            }

        } else {
            this._processMultipleSelection(item);
        }
    }

    addValidators(): void {}

    resetSelectedItems(): void {
        if (this._clonedItems) {
            this._clonedItems.forEach(c => c.selected = false);
        }
        this.selectedItems.length = 0;
        this._valueChangedFromInside = true;
        this.control.setValue(null);
    }

    get showClearAllButton(): boolean {
        let selectedCount = 0;
        this.selectedItems.forEach(i => {
            if (i.selected) {
                selectedCount++;
            }

            if (selectedCount > 1) {
                return;
            }
        });

        return selectedCount > 1;
    }

    get showSelectedItemClass() {
        return this.selectedItems.length > 0;
    }

    clearAll(e) {
        e.preventDefault();
        e.stopPropagation();

        this.resetSelectedItems();
    }

    private _updateSelectionWidth() {
        const that = this;

        // closure
        const setWidth = () => {
            let clientWidth: number = that.inputGroup ? that.inputGroup.nativeElement.clientWidth : 300;
            if (clientWidth > 305) {
                clientWidth = clientWidth - (clientWidth - 300);
            }
            
            that.selectionWidth = clientWidth - 22;
        }

        if (this._resizeSelectionWidth) {
            clearTimeout(this._resizeSelectionWidth);
        }
        
        this._resizeSelectionWidth = setTimeout(setWidth, 200);
    }

    private _updateSelectedItems(item: SelectionItem): void {
        // check if this.selectedItems value exist
        if (this.selectedItems) {
            // check if item.selected is true
            if (item.selected) {
                if (!this.multiple) {
                    // reset array for single selection
                    // to update new array with new object
                    this.selectedItems.length = 0;
                }
                if (this.selectedItems.indexOf(item) === -1) {
                    this.selectedItems.push(item);
                }
            } else {
                // remove the object when deselect
                this.selectedItems = this.selectedItems.filter(itemObj => itemObj.id !== item.id);
            }
            
            this.selectedItems = this._sortSelectedItemsByTitle(this.selectedItems);
            this._filterResults(this.query.value);
        }
    }

    /**
     * sort the selection alphabetically by title
     * @param a
     * @param b 
     */
    private _sortSelectedItemsByTitle(items: SelectionItem[]): any {
        return items.sort((a: any, b: any) => {
            if (a.title < b.title) { return -1; }
            if (a.title > b.title) { return 1; }
            return 0;
        });
    }

    private _updateSelectionText() {

        if (this.selectedItems) {
            this.selection = this.selectedItems
                .filter(item => {
                    return item.selected;
                })
                .map(item => {
                    return item.title;
                })
                // .join(this.multipleSeparator);
                .join(this.valueSeparator);
                
        }

        if (!this.selection) {
            this.selection = this.noneSelectedText;
        }
    }

    private _filterResults(filter: string | null) {
        const that = this;
        var items: SelectionItem[] = [];
        let contains = this.liveSearchStyle === 'contains';

        if (this._markForReset) {
            this.control.value = '';
            this.selectedItems.length = 0;
            this._markForReset = false;
        }

        if (!filter || filter === '') {
            // return items that are not selected
            this.filteredItems = this._clonedItems.filter(c => !c.selected).slice(this._resultsUpIndex, this._resultsDownIndex);
        } else {
            // filter selected items
            
            var count = 0;
            this._clonedItems.forEach(item => {
                if (!item || !item.title 
                    || items.find(s => s.id === item.id) !== undefined
                    || that.selectedItems.find(s => s.id === item.id) !== undefined) {
                    return;
                }

                if (item.selected) {
                    return items.push(item);
                }

                var shouldBeAdded = contains ?
                    item.title.toLowerCase().includes(filter.toLowerCase()) :
                    item.title.toLowerCase().startsWith(filter.toLowerCase());

                if (shouldBeAdded && count < this.pageSize) {
                    items.push(item);
                }
            });

            this.filteredItems = items;
            // .filter(f => !f.selected);
        }

        this.filteredItems = uniqBy(this.filteredItems, 'id');
        this.selectedItems = uniqBy(this.selectedItems, 'id');
    }

    private _processMultipleSelection(item: SelectionItem) {
        let selectedItems = this.selectedItems.filter(item => {
            return item.selected;
        });

        // only select the items if we are under the max options
        if (!item.selected && selectedItems.length >= this.maxOptions) {
            return;
        }

        const newSelectedItemIds = this.selectedItems
            .filter(i => i.selected)
            .map(i => i.id)
            .join(this.valueSeparator);

        this.control.setValue(newSelectedItemIds);
    }

    private _updateSelection(value) {
        const that = this;
        this._filterResults(this.query ? this.query.value : null);
        
        if (!value || value === '' ||
            !this._clonedItems || this._clonedItems.length < 1) {
                // when it's a new form, filter items whose selected value is not true
                this.selectedItems = this.selectedItems.filter(item => item.selected);
                if (this.selectedItems.length && (this.selection !== this.noneSelectedText)) {
                    // i.e. when deselected last selected item, remove from selectedItems
                    this.selectedItems = this.selectedItems.filter(item => item.title !== this.selection);
                }
                this.selectedItems = uniqBy(this.selectedItems, 'id');
                this._updateSelectionText();
                return;
        }

        let dataItems: string[] = [];
        let newSelection: string[] = [];

        if (typeof value === 'string') { // coma delimited string
            dataItems = value.split(this.valueSeparator).map(i => i.trim());
        } else if (isArray(value)) { // array of ids
            dataItems = value.map(d => String(d));
        }

        if (!this.multiple) {
            // just in case this control receives multiple values when it is not supported
            dataItems = [dataItems[0]];
            // clear all selections
            this._clonedItems.forEach(i => i.selected = false);
        } 
        
        // select all items that math with the dataItems array
        this.selectedItems = this._clonedItems.filter(i => dataItems.indexOf(<any>i.id) !== -1);

        for (let i = 0; i < this.selectedItems.length; i++) {
            const index = dataItems.find(e => e === that.selectedItems[i].id);
            if (index) {
                that.selectedItems[i].selected = true;
                newSelection = newSelection.concat(String(that.selectedItems[i].title));
            }
        }

        // filter by selected just in case there is duplicate object in both SelectionItem[]
        // that.selectedItems = that.selectedItems.filter(item => item.selected);
        // that.filteredItems = that.filteredItems.filter(item => !item.selected);

        // remove the current value if does not apply anymore
        const newValueCheckedAgainstItems = that.selectedItems
            .filter(i => i.selected)
            .map(i => i.id)
            .join(this.valueSeparator);

        if (this.control.value !== newValueCheckedAgainstItems) {
            this.control.setValue(newValueCheckedAgainstItems, { emitEvent: false });
        }

        this._updateSelectionText();
        this._filterResults(this.query ? this.query.value : null);
    }

    private _ismarkForReset(value: string): boolean {
        return (!isNull(value) &&
                !isUndefined(value) &&
                (isString(value) &&
                value.length)) ? true : false;
    }

    private _filterControlQuery() {
        if (this.filterControl && (this.field === this.filterControl)) {
            const that = this;
            this._querySubscription.push(this.query.valueChanges.subscribe(value => {
                that.filterControlQueryChanged.emit(value);
            }));
        }
    }

    

}
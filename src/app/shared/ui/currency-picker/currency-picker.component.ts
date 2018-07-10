import { Currency } from '../../models';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { ToSelectionItemList } from '../../extentions';

import { SelectionItem } from '../../../ng-material-components';
@Component({
    selector: 'kpi-currency-picker',
    templateUrl: 'currency-picker.component.pug'
})
export class CurrencyPickerComponent implements OnInit {
    @Input() selectedCurrencyId: string;
    @Input() fg: FormGroup;
    @Input() currencyCollection: Currency[] = [];

    @HostBinding('class.h-100')
    @HostBinding('class.w-100')
    takeAllSpace = true;

    currencies: SelectionItem[];

    constructor() { };

    ngOnInit() {
      setTimeout(() =>  {
          this._updateCurrencyList();
        }
      , 1000);
    }

    private _updateCurrencyList() {
      if (!this.currencyCollection.length) { return; }

      this.currencies = ToSelectionItemList(this.currencyCollection, 'id', 'displayName', this.selectedCurrencyId);
    }
}

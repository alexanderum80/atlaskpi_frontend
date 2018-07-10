import { Language } from '../../models';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { ToSelectionItemList } from '../../extentions';

import { SelectionItem } from '../../../ng-material-components';
@Component({
    selector: 'kpi-language-picker',
    templateUrl: 'language-picker.component.pug'
})
export class LanguagePickerComponent implements OnInit {
    @Input() selectedLanguageId: string;
    @Input() fg: FormGroup;
    @Input() languageCollection: Language[] = [];

    @HostBinding('class.h-100')
    @HostBinding('class.w-100')
    takeAllSpace = true;

    languages: SelectionItem[];

    constructor() { };

    ngOnInit() {
      setTimeout(() =>  {
          this._updateLangaugeList();
        }
      , 1000);
    }

    private _updateLangaugeList() {
      if (!this.languageCollection.length) { return; }

      this.languages = ToSelectionItemList(this.languageCollection, 'code', 'name', this.selectedLanguageId);
    }
}

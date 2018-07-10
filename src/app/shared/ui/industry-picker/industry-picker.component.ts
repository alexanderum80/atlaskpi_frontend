import { Industry } from '../../models/industry';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { SelectionItem } from '../../../ng-material-components';
@Component({
    selector: 'kpi-industry-picker',
    templateUrl: 'industry-picker.component.pug'
})
export class IndustryPickerComponent implements OnInit, OnDestroy {
    @Input() selectedIndustryId: string;
    @Input() selectedSubIndustryId: string;
    @Input() fg: FormGroup;
    @Input() industryCollection: Industry[] = [];
    @Input() direction = 'row';
    @Input() padding = false;
    @Input() withIcons = false;

    takeAllSpace = true;

    industrySub: Subscription;

    industries: SelectionItem[] = [];
    subIndustries: SelectionItem[] = [];
    industryIcon = '';
    subIndustryIcon = '';

    constructor() { };

    ngOnInit() {
        if (this.withIcons) {
            this.industryIcon = 'store';
            this.subIndustryIcon = 'layers';
        }

      setTimeout(() =>  {
          this._updateIndustryList();
          if (this.selectedSubIndustryId && this.selectedSubIndustryId.length > 0) {
              this._updateSubIndustryList(this.selectedIndustryId);
          }
          this._subscribeToIndustryChanges();
        }
      , 500);
    }

    ngOnDestroy() {
        this.industrySub.unsubscribe();
    }

    reset() {
        this.industrySub.unsubscribe();
        this.ngOnInit();
    }

    private _updateIndustryList() {
      if (!this.industryCollection || !this.industryCollection.length) { return; }
      this.industries = this.industryCollection
                        .map(i => {
                           return new SelectionItem(i._id,
                                                    i.name,
                                                    i._id === this.selectedIndustryId);
                        });
    }

    private _updateSubIndustryList(industryId: string) {
        const industry = this.industryCollection.filter(
            i => { return i._id === industryId; }
        )[0];

        if (!industry || !industry.subIndustries
            || industry.subIndustries.length < 1) {
            this.subIndustries = new Array<SelectionItem>();
            return;
        }

        this.subIndustries = industry.subIndustries.map(
            s => new SelectionItem(s._id, s.name, s._id === this.selectedSubIndustryId  &&
                                   industry._id === this.selectedIndustryId)
        );
    }

    private _subscribeToIndustryChanges() {
        this.industrySub =  this.fg.controls['industry'].valueChanges
            .subscribe(id => { this._updateSubIndustryList(id); });
    }

    get componentClass(): string  {
        const padding = this.padding ? 'layout-padding' : '';
        const layout = this.direction === 'row' ? 'layout-row' : 'layout-column';
        return `${layout} ${padding}`;
    }
}

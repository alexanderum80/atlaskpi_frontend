import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';

import { FormGroupTypeSafe } from '../../shared/services';
import { IListItem } from '../../shared/ui/lists/list-item';
import { Subscription } from 'apollo-client/util/Observable';
import { ITarget, TargetTypeEnum } from '../shared/models/target';
import { Validators } from '@angular/forms';

@Component({
    selector: 'app-basic-targets',
    templateUrl: './basic-targets.component.pug',
    styleUrls: ['./basic-targets.component.scss'],
})
export class BasicTargetsComponent implements OnInit, OnDestroy {
    @Input()
    fg: FormGroupTypeSafe<ITarget>;
    @Input()
    appliesToList: IListItem[] = [];
    @Input()
    objectiveList: IListItem[];
    @Input()
    baseOnList: IListItem[];
    @Input()
    displayAppliesToField: boolean;

    showBasedOn: boolean;

    unitOptions = [ '%', '#' ];
    showUnitOptions = true;

    private basedOnSub: Subscription;
    private typeSub: Subscription;


    ngOnInit() {
        const typeCtrl = this.fg.getSafe(f => f.type);
        this.basedOnSub = typeCtrl.valueChanges
            .subscribe(t => this.updateBasedOnVisibility(t));
        this.updateBasedOnVisibility(typeCtrl.value);

        this.typeSub = this.fg.getSafe(f => f.type).valueChanges.subscribe(type => {
            this.updateUnitControl(type);
            this.updateCompareToControl(type);
        });

        this.updateUnitControl(this.fg.value.type);
    }

    ngOnDestroy() {
        this.basedOnSub.unsubscribe();
        this.typeSub.unsubscribe();
    }

    onOptionSelected(val) {
        this.fg.getSafe(f => f.unit).setValue(val);
    }

    get activeVisible(): boolean {
        return !this.fg.value._id ? false : true;
    }

    private updateBasedOnVisibility(val) {
        this.showBasedOn = val !== TargetTypeEnum.fixed;
    }

    private updateUnitControl(type: string) {
        const unitCtrl = this.fg.getSafe(f => f.unit);

        if (type === 'fixed') {
            this.showUnitOptions = false;
            unitCtrl.setValue('#');
        } else {
            this.showUnitOptions = true;
        }
    }

    private updateCompareToControl(type: string) {
        const compareToCtrl = this.fg.getSafe(f => f.compareTo);

        if (type === 'fixed') {
            compareToCtrl.setValidators([]);
        } else {
            compareToCtrl.setValidators([Validators.required]);
        }

        this.fg.getSafe(f => f.compareTo).updateValueAndValidity();
    }
}

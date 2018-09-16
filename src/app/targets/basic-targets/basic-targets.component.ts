import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';

import { FormGroupTypeSafe } from '../../shared/services';
import { IListItem } from '../../shared/ui/lists/list-item';
import { Subscription } from 'apollo-client/util/Observable';
import { ITarget, TargetTypeEnum } from '../shared/models/target';

@Component({
    selector: 'app-basic-targets',
    templateUrl: './basic-targets.component.pug',
    styleUrls: ['./basic-targets.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicTargetsComponent implements OnInit, OnDestroy {
    @Input()
    fg: FormGroupTypeSafe<ITarget>;
    @Input()
    groupingsList: IListItem[] = [];
    @Input()
    objectiveList: IListItem[];
    @Input()
    baseOnList: IListItem[];
    @Input()
    displayForField: boolean;

    showBasedOn: boolean;

    valueOptions = [ '%', '#' ];

    private basedOnSub: Subscription;

    ngOnInit() {
        const typeCtrl = this.fg.getSafe(f => f.type);
        this.basedOnSub = typeCtrl.valueChanges
            .subscribe(t => this.updateBasedOnVisibility(t));
        this.updateBasedOnVisibility(typeCtrl.value);
    }

    ngOnDestroy() {
        this.basedOnSub.unsubscribe();
    }

    onOptionSelected(val) {
        this.fg.getSafe(f => f.unit).setValue(val);
    }

    private updateBasedOnVisibility(val) {
        this.showBasedOn = val !== TargetTypeEnum.fixed;
    }
}

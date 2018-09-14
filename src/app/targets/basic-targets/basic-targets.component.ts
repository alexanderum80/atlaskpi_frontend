import { Component, Input } from '@angular/core';

import { ITarget } from '../../charts/chart-view/set-goal/shared/targets.interface';
import { FormGroupTypeSafe } from '../../shared/services';
import { IListItem } from '../../shared/ui/lists/list-item';

@Component({
    selector: 'app-basic-targets',
    templateUrl: './basic-targets.component.pug',
    styleUrls: ['./basic-targets.component.scss'],
})
export class BasicTargetsComponent {
    @Input()
    fg: FormGroupTypeSafe<ITarget>;
    @Input()
    groupingsList: IListItem[] = [];
    @Input()
    objectiveList: IListItem[];
    @Input()
    targetPeriodList: IListItem[];
    @Input()
    baseOnList: IListItem[];

    valueOptions = [ '%', '#' ];

    onOptionSelected(val) {
        console.log(val);
    }
}

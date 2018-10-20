import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormArray } from '@angular/forms';
import { IListItem } from '../../shared/ui/lists/list-item';
import { TargetScreenService } from '../shared/services/target-screen.service';

@Component({
    selector: 'app-milestones',
    templateUrl: './milestone.component.pug',
    styleUrls: ['./milestone.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneComponent {
    @Input()
    fa: FormArray;
    @Input()
    userList: IListItem[];

    constructor(private targetService: TargetScreenService) { }

    get isEmpty(): boolean {
        return this.fa.controls.length === 0;
    }

    get showAddMilestone(): boolean {
        return !this.isEmpty
            && this.fa.controls.filter(c => c.valid && c.pristine).length > 0;
    }

    add() {
        this.targetService.addMilestone();
    }
}

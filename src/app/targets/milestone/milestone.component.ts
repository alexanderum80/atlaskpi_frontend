import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormArray } from '@angular/forms';

@Component({
    selector: 'app-milestones',
    templateUrl: './milestone.component.pug',
    styleUrls: ['./milestone.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneComponent {
    @Input()
    fa: FormArray;

    get isEmpty(): boolean {
        return this.fa.controls.length === 0;
    }
}

import { Component, Input, OnInit } from '@angular/core';
import { FormGroupTypeSafe } from '../../../shared/services';
import { IMilestone } from '../../shared/models/targets.model';
import { TargetScreenService } from '../../shared/services/target-screen.service';
import { IListItem } from '../../../shared/ui/lists/list-item';

@Component({
  selector: 'kpi-form-milestone-target',
  templateUrl: './form-milestone-target.component.pug',
  styleUrls: ['./form-milestone-target.component.scss'],
})
export class FormMilestoneTargetComponent implements OnInit {
    @Input()
    fg: FormGroupTypeSafe<IMilestone>;
    @Input()
    userList: IListItem[];
    @Input()
    index: number;

    private milestone: IMilestone;

    constructor(private targetService: TargetScreenService) { }

    ngOnInit() {
        this.milestone = this.fg.value;
    }

    save() {
        this.fg.markAsPristine();
    }

    cancel() {
        if (!this.milestone.task) {
            this.targetService.removeMilestone(this.index);
        } else {
            this.fg.setValue(this.milestone);
            this.save();
        }
    }
}

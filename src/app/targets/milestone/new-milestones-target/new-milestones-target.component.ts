import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TargetScreenService } from '../../shared/services/target-screen.service';

@Component({
  selector: 'kpi-new-milestones-target',
  templateUrl: './new-milestones-target.component.pug',
  styleUrls: ['./new-milestones-target.component.scss']
})
export class NewMilestonesTargetComponent {

    constructor(private targetService: TargetScreenService) { }

    addMilestone() {
        this.targetService.addMilestone();
    }

}

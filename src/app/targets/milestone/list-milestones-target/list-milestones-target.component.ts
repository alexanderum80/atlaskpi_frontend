import { Component, OnInit, Input } from '@angular/core';
import { ListMilestoneViewModel } from './list-targets.viewmodel';

@Component({
  selector: 'kpi-list-milestones-target',
  templateUrl: './list-milestones-target.component.pug',
  styleUrls: ['./list-milestones-target.component.scss'],
  providers: [ListMilestoneViewModel]
})
export class ListMilestonesTargetComponent implements OnInit {
  @Input() vm: any;

  constructor(public vmm: ListMilestoneViewModel) {  }

  ngOnInit() {
    const that = this;

    if (!that.vmm.initialized) {
       that.vmm.initialize(null);
       that.vmm.milestone = that.vm.targets.milestone;
    }
  }

}

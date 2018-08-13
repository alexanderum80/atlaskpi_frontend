import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'kpi-add-milestones-target',
  templateUrl: './add-milestones-target.component.pug',
  styleUrls: ['./add-milestones-target.component.scss']
})
export class AddMilestonesTargetComponent implements OnInit {
  @Input() fg: FormGroup;
  @Input() vm: any;

  constructor() { }

  ngOnInit() {
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'kpi-milestone',
  templateUrl: './milestone.component.pug',
  styleUrls: ['./milestone.component.scss']
})
export class MilestoneComponent implements OnInit {
  @Input() fg: FormGroup;
  @Input() vm: any;

  addMilestones: boolean;
  editMilestones: boolean;

  constructor() { }

  ngOnInit() {
    this.addMilestones = true;
  }

  addEvent() {
    this.addMilestones = true;
  }
}

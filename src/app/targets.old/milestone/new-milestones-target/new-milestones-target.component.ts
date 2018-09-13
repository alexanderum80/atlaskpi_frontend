import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kpi-new-milestones-target',
  templateUrl: './new-milestones-target.component.pug',
  styleUrls: ['./new-milestones-target.component.scss']
})
export class NewMilestonesTargetComponent implements OnInit {
  @Output() selectedEvent = new EventEmitter(); //This event does not work, it should be to select the control add milestone

  @Output() selectAdd = false; //This test

  constructor() { }

  ngOnInit() {
  }

  addEvent() {
    this.selectedEvent.emit();
    this.selectAdd = true;
  }

}

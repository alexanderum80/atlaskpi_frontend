import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'kpi-form-milestone-target',
  templateUrl: './form-milestone-target.component.pug',
  styleUrls: ['./form-milestone-target.component.scss']
})
export class FormMilestoneTargetComponent implements OnInit {
  @Input() fg: FormGroup;
  @Input() vm: any;
  
  constructor() { }

  ngOnInit() {
  }

}

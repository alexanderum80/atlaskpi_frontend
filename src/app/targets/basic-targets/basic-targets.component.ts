import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { SelectionItem } from '../../ng-material-components';

@Component({
  selector: 'kpi-basic-targets',
  templateUrl: './basic-targets.component.pug',
  styleUrls: ['./basic-targets.component.scss']
})
export class BasicTargetsComponent implements OnInit {
  @Input() fg: FormGroup;
  @Input() vm: any;

  constructor() { }

  ngOnInit() {
    const that = this;
  }

}

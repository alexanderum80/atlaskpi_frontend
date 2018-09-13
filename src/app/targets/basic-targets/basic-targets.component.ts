import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'kpi-basic-targets',
  templateUrl: './basic-targets.component.pug',
  styleUrls: ['./basic-targets.component.scss']
})
export class BasicTargetsComponent {
  @Input() fg: FormGroup;
}

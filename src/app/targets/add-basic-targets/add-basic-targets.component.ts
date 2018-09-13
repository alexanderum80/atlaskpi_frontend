import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'kpi-add-basic-targets',
  templateUrl: './add-basic-targets.component.pug',
  styleUrls: ['./add-basic-targets.component.scss']
})
export class AddBasicTargetsComponent {
  @Input() fg: FormGroup;
}

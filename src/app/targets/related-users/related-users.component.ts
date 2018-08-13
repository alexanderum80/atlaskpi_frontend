import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'kpi-related-users',
  templateUrl: './related-users.component.pug',
  styleUrls: ['./related-users.component.scss']
})
export class RelatedUsersComponent implements OnInit {
  @Input() fg: FormGroup;
  @Input() vm: any;

  constructor() { }

  ngOnInit() {
  }

}

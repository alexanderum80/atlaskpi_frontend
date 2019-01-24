import { FormGroup, FormControl } from '@angular/forms';
import { IUserInfo } from './../../../../shared/models/user';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kpi-user-selection',
  templateUrl: './user-selection.component.pug',
  styleUrls: ['./user-selection.component.scss']
})
export class UserSelectionComponent implements OnInit {
  @Input() user: any;
  @Output() selectedStatus = new EventEmitter<boolean>();

  fg: FormGroup = new FormGroup({
    'selected': new FormControl('')
  });

  constructor() { }

  ngOnInit() {
    this._updateCurrentUserSelected();
    this._subscribeToFormChange();
  }

  private _updateCurrentUserSelected() {
    if (this.user.selected === true) {
      this.fg.controls['selected'].setValue(true);
    }
  }

  private _subscribeToFormChange() {
    this.fg.valueChanges.subscribe(fg => {
      this.selectedStatus.emit(fg.selected === true ? true : false);
    });
  }

}

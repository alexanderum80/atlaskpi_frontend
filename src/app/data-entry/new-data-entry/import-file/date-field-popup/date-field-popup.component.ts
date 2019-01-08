import { DialogResult } from './../../../../shared/models/dialog-result';
import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalComponent } from 'src/app/ng-material-components';
import { DataEntryFormViewModel } from '../../../data-entry.viewmodel';

@Component({
  selector: 'kpi-date-field-popup',
  templateUrl: './date-field-popup.component.pug',
  styleUrls: ['./date-field-popup.component.scss']
})
export class DateFieldPopupComponent implements OnInit {
  @Output() done = new EventEmitter<DialogResult>();
  @ViewChild('dateFieldPopup') dateFieldPopup: ModalComponent;

  defaultValue;

  constructor(
    public vm: DataEntryFormViewModel
  ) { }

  ngOnInit() {
    this.vm.initialize(this.vm.getDefaultDateRangeSchema());
  }

  open() {
    this.dateFieldPopup.open();
    this.defaultValue = this.vm.dateFields[0].id;
  }

  closeModal() {
    this.done.emit(DialogResult.OK);
  }

  close() {
    this.defaultValue = undefined;
    this.dateFieldPopup.close();
  }

}

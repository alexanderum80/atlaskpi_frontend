import { DialogResult } from './../../models/dialog-result';
import { Component, EventEmitter, OnInit, Input, ViewChild, Output } from '@angular/core';
import { ModalComponent } from 'src/app/ng-material-components';

@Component({
  selector: 'app-remove-confirmation',
  templateUrl: './remove-confirmation.component.pug',
  styleUrls: ['./remove-confirmation.component.scss']
})
export class RemoveConfirmationComponent implements OnInit {
  @Input() element: string;
  @Output() dialogResult = new EventEmitter<DialogResult>();
  @ViewChild('removeConfirmationModal') removeModal: ModalComponent;

  constructor() { }

  ngOnInit() {
  }

  open() {
    this.removeModal.open();
  }

  close() {
    this.removeModal.close();
  }

  confirmRemove() {
    this.dialogResult.emit(DialogResult.OK);
  }

  cancelRemove() {
    this.dialogResult.emit(DialogResult.CANCEL);
  }

}

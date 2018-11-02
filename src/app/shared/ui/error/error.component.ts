import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DialogResult } from '../../models/dialog-result';
import { ModalComponent } from 'src/app/ng-material-components';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.pug',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  @Input() error: any;
  @Output() dialogResult = new EventEmitter<DialogResult>();
  @ViewChild('errorModal') errorModal: ModalComponent;

  constructor() { }

  ngOnInit() {
  }

  open() {
    this.errorModal.open();
  }

  close() {
    this.errorModal.close();
  }

}

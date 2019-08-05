import { FormGroup, FormControl } from '@angular/forms';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { EnterDataFormService } from './../../../enter-data-form/enter-data-form.service';
import { DataEntryFormViewModel } from './../../../data-entry.viewmodel';
import { ModalComponent } from './../../../../ng-material-components/modules/user-interface/modal/modal.component';
import { DialogResult } from './../../../../shared/models/dialog-result';
import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';

const heightDefault = 'calc(100vh - 240px)';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'kpi-invalid-rows-popup',
  templateUrl: './invalid-rows-popup.component.pug',
  styleUrls: ['./invalid-rows-popup.component.scss'],
  providers: [DataEntryFormViewModel]
})
export class InvalidRowsPopupComponent implements OnInit, OnChanges {
  @Input() invalidData;
  @Output() done = new EventEmitter<DialogResult>();
  @ViewChild('invalidRowsPopup') invalidRowsPopup: ModalComponent;

  height = heightDefault;

    defaultColDef = {
        filter: true,
        sortable: true,
        editable: true,
        resizable: true,
    };
    columnDefs = [];
    rowData: any[];
    isLoading = true;
    sidebarOpen: boolean;
    containerHeight;
    fullscreen = false;

    name: string;
    dataSourceCollection: any;

    selectedRows = false;

    private gridApi;
    private gridColumnApi;
    private recordsCount: number;

    fg: FormGroup = new FormGroup({
      'searchValue': new FormControl()
  });

  constructor(
        public vm: DataEntryFormViewModel,
        public deService: EnterDataFormService,
  ) { }

  ngOnInit() {
    debugger;
    this.name = this.invalidData.dataName;
    this.deService.registerDataSource(this.invalidData);
    this.isLoading = false;
  }

  ngOnChanges() {

  }

  open() {
    this.invalidRowsPopup.open();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
}

  closeModal() {
    this.done.emit(DialogResult.OK);
  }

  close() {
    this.invalidRowsPopup.close();
  }

}

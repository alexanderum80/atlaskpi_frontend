import { CustomFormViewModel } from './custom-datasource.viewmodel';
import { DialogResult } from '../../shared/models/dialog-result';
import { ModalComponent } from '../../ng-material-components/modules/user-interface/modal/modal.component';
import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'kpi-custom-datasource',
  templateUrl: './custom-datasource.component.pug',
  styleUrls: ['./custom-datasource.component.scss']
})
export class CustomComponent {
  @ViewChild('connectCustom') modal: ModalComponent;

  importFilePath: string;
  enterDataPath: string;

  constructor(
    public vm: CustomFormViewModel
  ) {
    this.importFilePath = '../../../assets/img/datasources/folder.png';
    this.enterDataPath = '../../../assets/img/datasources/data.png';
  }

  open() {
    this.modal.open();
  }

  cancel() {
    this.modal.close();
  }

  processDialogResult(result: DialogResult) {
    if (result === DialogResult.CANCEL) {
      this.cancel();
    }
  }

  toogleSelectedInputType(inputType: string) {
    this.vm.updateSelectedInputType(inputType);
  }

}

import { DataEntryFormViewModel } from './data-entry.viewmodel';
import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'kpi-new-data-entry',
  templateUrl: './new-data-entry.component.pug',
  styleUrls: ['./new-data-entry.component.scss'],
  providers: [DataEntryFormViewModel]
})
export class NewDataEntryComponent implements OnDestroy {

  constructor(
    public vm: DataEntryFormViewModel
  ) {}

  ngOnDestroy() {
    this.vm.selectedInputType = null;
  }

  itemClicked(event) {
    this.vm.selectedInputType = event.item.id;
  }

}

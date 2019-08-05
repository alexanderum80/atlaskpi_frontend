import { DataEntryFormViewModel } from '../data-entry.viewmodel';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Activity } from 'src/app/shared/authorization/decorators/component-activity.decorator';
import { AddAtlasSheetsActivity } from 'src/app/shared/authorization/activities/atlas-sheets/add-atlas-sheets.activity';

@Activity(AddAtlasSheetsActivity)
@Component({
  selector: 'kpi-new-data-entry',
  templateUrl: './new-data-entry.component.pug',
  styleUrls: ['./new-data-entry.component.scss'],
  providers: [DataEntryFormViewModel]
})
export class NewDataEntryComponent implements OnInit, OnDestroy {

  constructor(
    public vm: DataEntryFormViewModel,
    private _router: Router
  ) {}

  ngOnInit() {
    if (!this.vm.dataEntryPermission()) {
      this._router.navigateByUrl('/unauthorized');
    }
  }

  ngOnDestroy() {
    this.vm.selectedInputType = null;
  }

  itemClicked(event) {
    this.vm.selectedInputType = event.item.id;
  }

}

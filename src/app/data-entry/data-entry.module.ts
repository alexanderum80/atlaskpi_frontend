import { PredefinedTemplateComponent } from './new-data-entry/predefined-template/predefined-template.component';
import { CustomListSummaryComponent } from './custom-list/custom-list-summary/custom-list-summary.component';
import { DataEntryComponent } from './data-entry.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataEntryRoutingModule } from './data-entry-routing.module';
import { ShowAllDataEntryComponent } from './show-all-data-entry/show-all-data-entry.component';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { SharedModule } from '../shared';
import { NewDataEntryComponent } from './new-data-entry/new-data-entry.component';
import { ImportFileComponent } from './new-data-entry/import-file/import-file.component';
import { SchemaFormComponent } from './new-data-entry/define-schema/define-schema.component';
import { EnterDataFormComponent } from './enter-data-form/enter-data-form.component';
import { DateFieldPopupComponent } from './new-data-entry/import-file/date-field-popup/date-field-popup.component';
import { DataEntryFormViewModel } from './new-data-entry/data-entry.viewmodel';
import { UserSelectionComponent } from './shared/ui/user-selection/user-selection.component';
import { CustomListFormComponent } from './custom-list/custom-list-form/custom-list-form.component';
import { NewCustomListComponent } from './custom-list/new-custom-list/new-custom-list.component';
import { CustomListFormViewModel } from './custom-list/custom-list-form/custom-list.viewmodel';
import { CustomListComponent } from './custom-list/custom-list.component';
import { MyFilterPipe } from './shared/pipe/filter-pipe';

@NgModule({
  imports: [
    CommonModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    SharedModule,
    DataEntryRoutingModule
  ],
  declarations: [DataEntryComponent, ShowAllDataEntryComponent, MyFilterPipe,
        NewDataEntryComponent, ImportFileComponent, SchemaFormComponent,
        EnterDataFormComponent, DateFieldPopupComponent, UserSelectionComponent, PredefinedTemplateComponent,
        CustomListFormComponent, NewCustomListComponent, CustomListComponent, CustomListSummaryComponent],
  exports: [DataEntryComponent],
  providers: [DataEntryFormViewModel, CustomListFormViewModel]
})
export class DataEntryModule { }

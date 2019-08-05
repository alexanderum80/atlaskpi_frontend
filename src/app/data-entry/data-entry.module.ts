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
import { DataEntryFormViewModel } from './data-entry.viewmodel';
import { UserSelectionComponent } from './shared/ui/user-selection/user-selection.component';
import { CustomListFormComponent } from './custom-list/custom-list-form/custom-list-form.component';
import { NewCustomListComponent } from './custom-list/new-custom-list/new-custom-list.component';
import { CustomListFormViewModel } from './custom-list/custom-list.viewmodel';
import { CustomListComponent } from './custom-list/custom-list.component';
import { AgGridModule } from 'ag-grid-angular';
import { UnsavedChangesGuard } from './unsaved-changes-guard.service';
import { UpdateDataComponent } from './update-data/update-data.component';
import { EditDataEntryComponent } from './edit-data-entry/edit-data-entry.component';
import { UpdateDataAtlasSheetsActivity } from '../shared/authorization/activities/atlas-sheets/update-data-atlas-sheets.activity';
import { AddAtlasSheetsActivity } from '../shared/authorization/activities/atlas-sheets/add-atlas-sheets.activity';
import { DeleteAtlasSheetsActivity } from '../shared/authorization/activities/atlas-sheets/delete-atlas-sheets.activity';
import { UpdateShemaAtlasSheetsActivity } from '../shared/authorization/activities/atlas-sheets/update-schema-atlas-sheets.activity';
import { ViewAtlasSheetsActivity } from '../shared/authorization/activities/atlas-sheets/view-atlas-sheets.activity';
import { DefineSchemaDetailsComponent } from './new-data-entry/define-schema-details/define-schema-details.component';
import { InvalidRowsPopupComponent } from './new-data-entry/import-file/invalid-rows-popup/invalid-rows-popup.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    SharedModule,
    DataEntryRoutingModule,
    AgGridModule.withComponents([]),
  ],
  declarations: [DataEntryComponent, ShowAllDataEntryComponent,
        NewDataEntryComponent, ImportFileComponent, SchemaFormComponent,
        EnterDataFormComponent, DateFieldPopupComponent, UserSelectionComponent, PredefinedTemplateComponent,
        CustomListFormComponent, NewCustomListComponent, CustomListComponent,
        CustomListSummaryComponent, UpdateDataComponent, EditDataEntryComponent, DefineSchemaDetailsComponent, InvalidRowsPopupComponent],
  exports: [DataEntryComponent],
  providers: [
    DataEntryFormViewModel,
    CustomListFormViewModel,
    UnsavedChangesGuard,
    UpdateDataAtlasSheetsActivity,
    AddAtlasSheetsActivity,
    DeleteAtlasSheetsActivity,
    UpdateShemaAtlasSheetsActivity,
    ViewAtlasSheetsActivity
  ]
})
export class DataEntryModule { }

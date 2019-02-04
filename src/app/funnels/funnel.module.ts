import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FunnelRoutingModule } from './funnel-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared';
import { FunnelComponent } from './funnel.component';
import { ListFunnelComponent } from './list-funnel/list-funnel.component';
import { NoFunnelComponent } from './no-funnel/no-funnel.component';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { ShowFunnelComponent } from './show-funnel/show-funnel.component';
import { NewFunnelComponent } from './new-funnel/new-funnel.component';
import { FunnelFormComponent } from './funnel-form/funnel-form.component';
import { StageFormComponent } from './stage-form/stage-form.component';
import { FunnelService } from './shared/services/funnel.service';
import { FunnelPreviewComponent } from './funnel-preview/funnel-preview.component';
import { FunnelPreviewStageComponent } from './funnel-preview-stage/funnel-preview-stage.component';
import { EditFunnelComponent } from './edit-funnel/edit-funnel.component';
import { FunnelStageDetailsComponent } from './funnel-stage-details/funnel-stage-details.component';
import { AgGridModule } from '../../../node_modules/ag-grid-angular';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    FunnelRoutingModule,
    AgGridModule.withComponents([]),

  ],
  declarations: [
    FunnelComponent,
    ListFunnelComponent,
    NoFunnelComponent,
    ShowFunnelComponent,
    NewFunnelComponent,
    FunnelFormComponent,
    StageFormComponent,
    FunnelPreviewComponent,
    FunnelPreviewStageComponent,
    EditFunnelComponent,
    FunnelStageDetailsComponent],
  exports: [FunnelComponent],
  providers: [ FunnelService ]
})
export class FunnelModule { }

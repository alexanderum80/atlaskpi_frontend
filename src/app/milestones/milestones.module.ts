import { UpdateMilestoneComponent } from './update-milestone/update-milestone.component';
import { SharedModule } from '../shared';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { MilestoneService } from './shared/services/milestone.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { MilestonesRoutingModule } from './milestones-routing.module';
import { MilestonesComponent } from './milestones.component';
import { AddMilestoneComponent } from './add-milestone/add-milestone.component';

@NgModule({
  imports: [
    CommonModule,
    MilestonesRoutingModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    SharedModule,
    NgxDatatableModule
  ],
  declarations: [ MilestonesComponent, AddMilestoneComponent, UpdateMilestoneComponent ],
  providers: [ MilestoneService ],
  exports: [ MilestonesComponent ]
})
export class MilestonesModule { }

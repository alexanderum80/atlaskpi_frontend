import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TargetsRoutingModule } from './targets-routing.module';
import { ListTargetsComponent } from './list-targets/list-targets.component';
import { BasicTargetsComponent } from './basic-targets/basic-targets.component';
import { RelatedUsersComponent } from './related-users/related-users.component';
import { MilestoneComponent } from './milestone/milestone.component';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { TargetComponent } from './target/target.component';
import { SharedModule } from '../shared';
import { ListMilestonesTargetComponent } from './milestone/list-milestones-target/list-milestones-target.component';
import { AddMilestonesTargetComponent } from './milestone/add-milestones-target/add-milestones-target.component';
import { EditMilestonesTargetComponent } from './milestone/edit-milestones-target/edit-milestones-target.component';
import { NewMilestonesTargetComponent } from './milestone/new-milestones-target/new-milestones-target.component';
import { FormMilestoneTargetComponent } from './milestone/form-milestone-target/form-milestone-target.component';
import { FormTargetsComponent } from './form-targets/form-targets.component';

@NgModule({
  imports: [
    CommonModule,
    TargetsRoutingModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  declarations: [FormTargetsComponent, ListTargetsComponent, BasicTargetsComponent, RelatedUsersComponent, MilestoneComponent, TargetComponent, ListMilestonesTargetComponent, AddMilestonesTargetComponent, EditMilestonesTargetComponent, NewMilestonesTargetComponent, FormMilestoneTargetComponent],
  exports:[FormTargetsComponent]
})
export class TargetsModule { }

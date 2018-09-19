import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TargetsRoutingModule } from './targets-routing.module';
import { ListTargetsComponent } from './list-targets/list-targets.component';
import { BasicTargetsComponent } from './basic-targets/basic-targets.component';
import { RelatedUsersComponent } from './related-users/related-users.component';
import { MilestoneComponent } from './milestone/milestone.component';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { SharedModule } from '../shared';
import { NewMilestonesTargetComponent } from './milestone/new-milestones-target/new-milestones-target.component';
import { FormMilestoneTargetComponent } from './milestone/form-milestone-target/form-milestone-target.component';
import { FormTargetsComponent } from './form-targets/form-targets.component';
import { TargetsScreenComponent } from './targets-screen/targets-screen.component';
import { MilestoneItemComponent } from './milestone/milestone-item/milestone-item.component';

@NgModule({
    imports: [
        CommonModule,
        TargetsRoutingModule,
        MaterialFormsModule,
        MaterialUserInterfaceModule,
        ReactiveFormsModule,
        SharedModule,
    ],
    declarations: [
        FormTargetsComponent,
        ListTargetsComponent,
        BasicTargetsComponent,
        RelatedUsersComponent,
        MilestoneComponent,
        NewMilestonesTargetComponent,
        FormMilestoneTargetComponent,
        TargetsScreenComponent,
        MilestoneItemComponent,
    ],
    exports: [TargetsScreenComponent],
})
export class TargetsModule {}

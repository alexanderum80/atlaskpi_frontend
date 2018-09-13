import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ListMiestoneViewModel } from './list-milestones.viewmodel';
import { IMilestone } from '../../shared/models/targets.model';
import { ApolloService } from '../../../shared/services/apollo.service';
import { Action } from 'rxjs/internal/scheduler/Action';
import { IUser } from '../../../users/shared';
import {filter} from 'lodash';
import { EditMilestonesTargetComponent } from '../edit-milestones-target/edit-milestones-target.component';
import { FormMilestoneTargetComponent } from '../form-milestone-target/form-milestone-target.component';

const editMilestone = require('graphql-tag/loader!../edit-milestones-target/update-milestone.gql');

@Component({
  selector: 'kpi-list-milestones-target',
  templateUrl: './list-milestones-target.component.pug',
  styleUrls: ['./list-milestones-target.component.scss'],
  providers: [ListMiestoneViewModel]
})
export class ListMilestonesTargetComponent { }

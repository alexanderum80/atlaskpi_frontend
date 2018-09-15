import { Component } from '@angular/core';

const editMilestone = require('graphql-tag/loader!../edit-milestones-target/update-milestone.gql');

@Component({
  selector: 'kpi-list-milestones-target',
  templateUrl: './list-milestones-target.component.pug',
  styleUrls: ['./list-milestones-target.component.scss'],
})
export class ListMilestonesTargetComponent { }

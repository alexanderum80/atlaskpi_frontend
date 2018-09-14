import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

const milestoQuery = require('graphql-tag/loader!./list-milestones.gql');
const deleteMilestone = require('graphql-tag/loader!./delete-milestone.gql');
const userQuery = require('graphql-tag/loader!./form-milestone-target/users.query.gql');

@Component({
  selector: 'app-milestones',
  templateUrl: './milestone.component.pug',
  styleUrls: ['./milestone.component.scss']
})
export class MilestoneComponent {
  @Input() fg: FormGroup;
}

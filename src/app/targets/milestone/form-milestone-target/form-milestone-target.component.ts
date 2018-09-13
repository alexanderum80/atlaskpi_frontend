import { Component } from '@angular/core';

import { FormMilestoneViewModel } from './form-milestone.viewmodel';

const usersQueryGql = require('graphql-tag/loader!./users.query.gql');


@Component({
  selector: 'kpi-form-milestone-target',
  templateUrl: './form-milestone-target.component.pug',
  styleUrls: ['./form-milestone-target.component.scss'],
  providers: [FormMilestoneViewModel]
})
export class FormMilestoneTargetComponent {}

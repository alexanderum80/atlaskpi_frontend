import { dashboardGraphqlActions } from '../shared/graphql';
import { IMutationResponse } from '../../shared/models/mutation-response';
import { IDashboard, Dashboard } from '../shared/models';
import { DashboardFormComponent } from '../dashboard-form/dashboard-form.component';
import { Apollo } from 'apollo-angular';
import { ModalComponent } from '../../ng-material-components';
import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Activity } from 'src/app/shared/authorization/decorators/component-activity.decorator';
import { ModifyDashboardActivity } from 'src/app/shared/authorization/activities/dashboards/modify-dashboard.activity';

@Activity(ModifyDashboardActivity)
@Component({
  selector: 'kpi-edit-dashboard',
  templateUrl: './edit-dashboard.component.pug',
  styleUrls: ['./edit-dashboard.component.scss']
})
export class EditDashboardComponent implements OnInit {
  @Input() headerText: string;
  @Input() DashboarModel;
  @ViewChild('dashboardModal') modal: ModalComponent;

  fg: FormGroup = new FormGroup({});

  constructor() { }

  ngOnInit() {
  }

}

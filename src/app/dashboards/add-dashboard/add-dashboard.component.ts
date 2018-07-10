import { dashboardGraphqlActions } from '../shared/graphql';
import { IMutationResponse } from './../../shared/models/mutation-response';
import { IDashboard, Dashboard } from '../shared/models';
import { DashboardFormComponent } from './../dashboard-form/dashboard-form.component';
import { Apollo } from 'apollo-angular';
import { ModalComponent } from '../../ng-material-components';
import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'kpi-add-dashboard',
  templateUrl: './add-dashboard.component.pug',
  styleUrls: ['./add-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddDashboardComponent implements OnInit {
  @Input() headerText: string;
  @Input() DashboarModel;
  @ViewChild('dashboardModal') modal: ModalComponent;

  fg: FormGroup = new FormGroup({});

  constructor(private _apollo: Apollo) { }

  ngOnInit() {
  }

  onDashboardFormEvent(e) {
    alert('add input');
  }


}

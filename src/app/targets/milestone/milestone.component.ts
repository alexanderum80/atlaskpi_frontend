import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ListMilestonesTargetComponent } from './list-milestones-target/list-milestones-target.component';
import { ApolloService } from '../../shared/services/apollo.service';
import { IMilestone } from '../shared/models/targets.model';
import { IUser } from '../../users/shared';
import { EditMilestonesTargetComponent } from './edit-milestones-target/edit-milestones-target.component';
import SweetAlert from 'sweetalert2';
import { filter } from 'lodash';


const milestoQuery = require('graphql-tag/loader!./list-milestones.gql');
const deleteMilestone = require('graphql-tag/loader!./delete-milestone.gql');
const userQuery = require('graphql-tag/loader!./form-milestone-target/users.query.gql');



@Component({
  selector: 'kpi-milestone',
  templateUrl: './milestone.component.pug',
  styleUrls: ['./milestone.component.scss']
})
export class MilestoneComponent implements OnInit {
  @Input() fg: FormGroup;
  @Input() vm: any;
  @Input() target: string;

  @ViewChild('listMilestone') listMilestone: ListMilestonesTargetComponent;
  @ViewChild('editMilestone') editMilestone: EditMilestonesTargetComponent;

  milestones: IMilestone[];
  allUsers: IUser[];

  addMilestones: boolean;
  editMilestones: boolean;
  titleAction: string;
  existMileston = false;
  milestone: any;

  private _subscription: Subscription[] = [];

  constructor(private _apolloService: ApolloService) { }

  ngOnInit() {
    this.addMilestones = false;
    this._subscription.push(this.fg.valueChanges.subscribe(value => {
      if(value['_id']) {
        this.refresh(value['_id']);
      }
    }));
    this.getAllUsers();
  }

  addEvent(): void {
    this.addMilestones = true;
    this.editMilestones = false;
    this.titleAction = 'Add an execution plan for this target';
    this.refresh(this.target);
  }

  cancel(event) {
      this.addMilestones = false;
      this.editMilestones = false;
  }

  refresh(target) {
    const that = this;
    this._apolloService.networkQuery < IMilestone[] > (milestoQuery, {
      target: target || ''
    }).then(d => {
        that.milestones  = d.milestonesByTarget || null;
        that.milestones.length === 0 ? that.existMileston  = false : that.existMileston = true;
    })
    .catch(err =>
      this._displayServerErrors(err))
    ;
  }

  add() {
    this.addMilestones = false;
    this.editMilestones = false;
    this.refresh(this.target);
  }

  edit(event) {
    this.editMilestones = true;
    this.addMilestones = false;
    this.titleAction = 'Milestones for this target';
    this.milestone = filter(this.milestones, {'_id': event}) ;
  }

  editStatus(event) {
    this.editMilestones = false;
    this.addMilestones = false;
    this.refresh(this.target);
  }

  delete(event) {
    const that = this;
    SweetAlert({
      title: 'Are you sure?',
      text: `Once mistelone's location has been deleted, you will not be able to recover it. Are you sure you want to delete it?`,
      type: 'warning',
      showConfirmButton: true,
      showCancelButton: true
  })
  .then((res) => {
      if (res.value === true) {
        this._apolloService.mutation < IMilestone > (deleteMilestone, {'id': event })
        .then(res1 => {
          that.refresh(that.target);
        })
        .catch(err => { this._displayServerErrors(err) ; });
      }
  });
}

private _displayServerErrors(err) {
  console.log('Server errors: ' + JSON.stringify(err));
}

private getAllUsers() {
  const that = this;
  this._apolloService.networkQuery < IUser[] >( userQuery).then(data => {
        that.allUsers = (<any>data).allUsers;
      }).catch(err => {
          console.log('Server errors: ' + JSON.stringify(err));
      });

}
}

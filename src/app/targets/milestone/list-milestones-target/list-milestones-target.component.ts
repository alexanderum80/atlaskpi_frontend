import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ListMiestoneViewModel } from './list-milestones.viewmodel';
import { IMilestone } from '../../shared/models/targets.model';
import { ApolloService } from '../../../shared/services/apollo.service';
import { Action } from 'rxjs/internal/scheduler/Action';
import { IUser } from '../../../users/shared';
import {filter} from 'lodash';

const editMilestone = require('graphql-tag/loader!../edit-milestones-target/update-milestone.gql');

@Component({
  selector: 'kpi-list-milestones-target',
  templateUrl: './list-milestones-target.component.pug',
  styleUrls: ['./list-milestones-target.component.scss'],
  providers: [ListMiestoneViewModel]
})
export class ListMilestonesTargetComponent implements OnInit {
  @Input() milestones: IMilestone[];
  @Input() model: IMilestone;
  @Input() target: any;
  @Input() allUsers: IUser[];
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onEditStatus = new EventEmitter<any>();

  constructor(private vml: ListMiestoneViewModel,
              private _apolloService: ApolloService) {  }

  ngOnInit() {
    const that = this;

    if (!that.vml.initialized) {
      that.vml.initialize(null);
      that.vml.allUsers = that.allUsers;
      that.vml.milestones = that.milestones;
    }

  }

  itemClicked(evente, item) {
  }

  actionClicked(item) {
    switch (item.action.id) {
      case 'edit' :
            this.onEdit.emit(item.item.id);
        break;
      case 'delete':
            this.onDelete.emit(item.item.id);
        break;
      case 'declined':
            this.save(item.item.id, 'declined');
        break;
      case 'complited':
          this.save(item.item.id, 'complited');
        break;
    }
  }

  save(id: string, status: string) {
    const that = this;
    const input = this.addPayload(status, id);
    this._apolloService.mutation < IMilestone > (editMilestone, {
      'id': id, 'input': input})
        .then(res => {
          that.onEditStatus.emit(status);
        })
        .catch(err =>
          that._displayServerErrors(err)
        );
  }

  private _displayServerErrors(err) {
    console.log('Server errors: ' + JSON.stringify(err));
  }

  private addPayload(status, id) {
    const value  = filter(this.milestones , {'_id': id});
    return {
        task: value[0].task,
        target: value[0].target ,
        dueDate: value[0].dueDate,
        status: status,
        responsible: value[0].responsible
    };
}


}

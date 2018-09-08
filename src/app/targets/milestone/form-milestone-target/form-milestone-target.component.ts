import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormMilestoneViewModel } from './form-milestone.viewmodel';
import { IMilestone } from '../../shared/models/targets.model';
import { SelectionItem } from '../../../ng-material-components';
import { Subscription } from 'apollo-client/util/Observable';
import { Apollo } from 'apollo-angular';
import {
  IDatePickerConfig,
} from '../../../ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';


const usersQueryGql = require('graphql-tag/loader!./users.query.gql');


@Component({
  selector: 'kpi-form-milestone-target',
  templateUrl: './form-milestone-target.component.pug',
  styleUrls: ['./form-milestone-target.component.scss'],
  providers: [FormMilestoneViewModel]
})
export class FormMilestoneTargetComponent implements OnInit {
  @Input() model: IMilestone ;
  @Input() vm: any;
  @Output() fg: FormGroup;
  @Output() onCancel = new EventEmitter<any>();
  @Output() onSave = new EventEmitter<any>();

  status: any;
  milestone: IMilestone;
  datePickerConfig: IDatePickerConfig;
  responsibleList: SelectionItem[] = [];

  private _subscription: Subscription[] = [];

  constructor(public vmm: FormMilestoneViewModel,
    private _apollo: Apollo ) { }

  ngOnInit() {
    this.datePickerConfig = {
      showGoToCurrent: false,
      format: 'MM/DD/YYYY'
  };
    this.vmm.initialize(this.model);
    this.getResponsibleList();
    this.refresh();
  }

  cancel() {
    this.onCancel.emit();
  }


  save(): void {
    this.onSave.emit();
  }

  private refresh() {
    const that = this;
    if (that.milestone !== undefined) {
      that.vmm.task = that.milestone.task;
      that.vmm.target = that.milestone.target;
      that.vmm.dueDate = that.milestone.dueDate;
      that.vmm.responsible = that.milestone.responsible;
      that.vmm.status = that.milestone.status;
      that.status  = that.milestone.status;
    }
  }

  private getResponsibleList() {
    const that = this;
    let name = '';
    this._subscription.push(
      this._apollo.query({
        query: usersQueryGql,
        fetchPolicy: 'network-only'
      }).subscribe(({data}) => {
        const allUsers = (<any>data).allUsers;
        allUsers.forEach(element => {
          if (element.profile !== undefined) {
            name = element.profile.firstName + ' ' + element.profile.lastName;
          } else {
            name = element.title;
          }
            that.responsibleList.push({id: element._id,
              title: name,
              selected: false,
              disabled: false});
            this.vmm.allUsers = allUsers;
            this.vmm.getReposibleList(that.responsibleList);
        });
     }));


      }
  }

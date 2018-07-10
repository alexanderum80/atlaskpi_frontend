import { CommonService } from '../../shared/services/common.service';
import { UsersService } from '../../users/shared/services';
import { MilestoneModel } from '../shared/models/milestone.model';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { IMilestone } from '../shared/milestones.interface';
import { Apollo } from 'apollo-angular/';
import { FormGroup } from '@angular/forms';
import { MilestoneService } from '../shared/services/milestone.service';
import { ModalComponent, SelectionItem } from '../../ng-material-components';
import { Subscription } from 'rxjs/Subscription';
import {
  IDatePickerConfig,
} from '../../ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';


const usersQueryGql = require('./users.query.gql');
const updateMilestoneGql = require('./update-milestone.mutation.gql');

@Component({
  selector: 'kpi-update-milestone',
  templateUrl: './update-milestone.component.pug',
  styleUrls: ['./update-milestone.component.scss']
})
export class UpdateMilestoneComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedMilestone: any;
  @Input() currentUser: any;

  @Output() onMilestone = new EventEmitter<any>();

  @ViewChild('milestoneModal') milestoneModal: ModalComponent;

  datePickerConfig: IDatePickerConfig;

  fg: FormGroup = new FormGroup({});

  statusList: SelectionItem[];

  formValid = false;

  responsibleList: SelectionItem[];

  isResponsibleSelected: boolean;
  isStatusSelected: boolean;
  isDueDateValid: boolean;

  imgPath: string;

  private _subscription: Subscription[] = [];

  constructor(private _milestoneService: MilestoneService,
              private _apollo: Apollo, private _userService: UsersService) {
    this.statusList = this._milestoneService.getStatusList();
    this.imgPath = this._milestoneService.milestoneImage;
  }

  ngOnInit() {
    const that = this;

    this._subscription.push(
      this._milestoneService.editMilestone$.subscribe(milestone => {
        if (milestone) {
          that.selectedMilestone = milestone;
          that.fg.patchValue(that.selectedMilestone.form);
        }
      })
    );
    
  this.datePickerConfig = {
      showGoToCurrent: false,
      format: 'MM/DD/YYYY'
  };

  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  ngAfterViewInit() {
    const that = this;

    that.updateResponsibleList();

    that._subscription.push(
      that.fg.valueChanges
        .subscribe(v => {
          that.isResponsibleSelected = v.responsible ? true : false;
          that.isStatusSelected = v._status ? true : false;
          that.isDueDateValid = that._milestoneService.validDateFormat(v.dueDate);
        })
    );
  }

  updateResponsibleList(): void {
    const that = this;

    that._subscription.push(
      that._apollo.query({
        query: usersQueryGql,
        fetchPolicy: 'network-only'
      }).subscribe(({data}) => {
        that.responsibleList = that._milestoneService.processUsersList((<any>data).allUsers);
      })
    );
  }

  save(): void {
    const that = this;
    const fg = this.fg.value;
    this._apollo.mutate({
        mutation: updateMilestoneGql,
        variables: {
          _id: that.selectedMilestone._id,
          input: {
            target: that.selectedMilestone.form.target,
            task: fg.task,
            dueDate: fg.dueDate,
            status: fg._status,
            responsible: that._milestoneService.multiSelectArrayFormat(fg.responsible)
          }
        },
        refetchQueries: [
            'GetMilestonesByTarget'
        ]
      })
      .subscribe(({data}) => {
        // send notification email
        const dueDate = (<any>data).updateMilestone.entity.dueDate;
        const task = (<any>data).updateMilestone.entity.task;

          that.milestoneModal.close();
          that.onMilestone.emit({click: 'save', mode: 'view', update: true});

          that._milestoneService.userMilestoneNotification(fg.responsible, { task: task, dueDate: dueDate});
        });
  }

  cancel(): void {
    this.milestoneModal.close();
    this.onMilestone.emit({click: 'cancel', mode: 'view'});
  }

  modalClose(): void {
    this.milestoneModal.close();
  }

  open(): void {
    if (this.milestoneModal && (<any>this.milestoneModal).visible === false) {
      this.milestoneModal.open();
    }
  }
}

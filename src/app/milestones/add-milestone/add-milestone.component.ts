import { CommonService } from '../../shared/services/common.service';
import { AutoUnsubscribe } from '../../data-source/shared/auto-unsubscribe';
import { ModalComponent, SelectionItem } from '../../ng-material-components';
import { UsersService } from '../../users/shared/services';
import { MilestoneModel } from '../shared/models/milestone.model';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import {IMilestone} from '../shared/milestones.interface';
import { Apollo } from 'apollo-angular';
import { FormGroup } from '@angular/forms';
import { MilestoneService } from '../shared/services/milestone.service';
import { Subscription } from 'rxjs/Subscription';
import {
  IDatePickerConfig,
} from '../../ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';


const usersQueryGql = require('graphql-tag/loader!./users.query.gql');
const createMilestoneGql = require('graphql-tag/loader!./create-milestone.mutation.gql');

@Component({
  selector: 'kpi-add-milestone',
  templateUrl: './add-milestone.component.pug',
  styleUrls: ['./add-milestone.component.scss']
})
export class AddMilestoneComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedTarget: any;
  @Input() currentUser: any;

  @Output() onMilestone = new EventEmitter<any>();

  @ViewChild('milestoneModal') milestoneModal: ModalComponent;

  datePickerConfig: IDatePickerConfig;
  fg: FormGroup = new FormGroup({});
  formValid = false;
  responsibleList: SelectionItem[];
  isResponsibleValid: boolean;
  isDueDateValid: boolean;

  modelFields = {
    task: undefined,
    dueDate: undefined,
    responsible: undefined
  };

  imgPath: string;

  private _subscription: Subscription[] = [];

  constructor(
    private _milestoneService: MilestoneService,
    private _apollo: Apollo,
    private _userService: UsersService) {
      this.imgPath = this._milestoneService.milestoneImage;
    }

  ngOnInit() {
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

    that.getResponsibleList();

    that._subscription.push(
      that.fg.valueChanges
        .subscribe(v => {
          that.isResponsibleValid = v.responsible.length ? true : false;
          that.isDueDateValid = that._milestoneService.validDateFormat(v.dueDate);
        })
    );
  }

  getResponsibleList() {
    const that = this;

    this._subscription.push(
      this._apollo.query({
        query: usersQueryGql,
        fetchPolicy: 'network-only'
      }).subscribe(({data}) => {
        that.responsibleList = that._milestoneService.processUsersList((<any>data).allUsers);
      })
    );
  }

  save(action) {
    const that = this;
    const fg = this.fg.value;

    this._apollo.mutate({
        mutation: createMilestoneGql,
        variables: {
          input: {
            target: that.selectedTarget.id,
            task: fg.task,
            dueDate: fg.dueDate,
            status: 'Due',
            responsible: that._milestoneService.multiSelectArrayFormat(fg.responsible)
          }
        }
      })
      .toPromise()
      .then(({data}) => {
        // send notification email
        that._milestoneService.userMilestoneNotification(fg.responsible, { task: fg.task, dueDate: fg.dueDate });

        if (action === 'continue') {
          this.fg.patchValue(this.modelFields);
        } else {
          this.milestoneModal.close();
          that.onMilestone.emit({click: 'save', mode: 'view', update: true});
        }
      });
  }

  cancel() {
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

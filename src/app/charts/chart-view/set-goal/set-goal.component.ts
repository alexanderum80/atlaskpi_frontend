import { ViewTargetActivity } from '../../../shared/authorization/activities/targets/view-target.activity';
import { MilestoneService } from '../../../milestones/shared/services/milestone.service';
import { MilestonesComponent } from '../../../milestones/milestones.component';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    OnDestroy,
    Output,
    ViewChild,
} from '@angular/core';
import { Apollo } from 'apollo-angular';
import * as moment from 'moment';
import SweetAlert from 'sweetalert2';
import { ModalComponent, SelectionItem } from '../../../ng-material-components';
import { DialogResult } from '../../../shared/models/dialog-result';
import { ChartData } from '../../shared/models/chart.models';
import { EditGoalComponent } from './edit-goal/edit-goal.component';
import { targetApi } from './graphqlActions/set-goal-actions';
import { NewGoalComponent } from './new-goal/new-goal.component';
import { TargetService } from './shared/target.service';
import { ApolloService } from '../../../shared/services/apollo.service';
import { SetGoalsViewModel } from './set-goal.viewmodel';
import { ISearchArgs } from '../../../shared/ui/lists/item-list/item-list.component';
import { IActionItemClickedArgs } from '../../../shared/ui/lists/item-clicked-args';
import { IListItem } from '../../../shared/ui/lists/list-item';
import { UpdateTargetActivity } from '../../../shared/authorization/activities/targets/update-target.activity';
import { AddTargetActivity } from '../../../shared/authorization/activities/targets/add-target.activity';
import { DeleteTargetActivity } from '../../../shared/authorization/activities/targets/delete-target.activity';
import { Activity } from '../../../shared/authorization/decorators/component-activity.decorator';
import { IItemListActivityName } from '../../../shared/interfaces/item-list-activity-names.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import {CommonService} from '../../../shared/services/common.service';

@Activity(ViewTargetActivity)
@Component({
  selector: 'kpi-set-goal',
  templateUrl: './set-goal.component.pug',
  styleUrls: ['./set-goal.component.scss'],
      providers: [SetGoalsViewModel, AddTargetActivity, UpdateTargetActivity, DeleteTargetActivity]

})
export class SetGoalComponent implements OnInit, OnDestroy, AfterViewInit {
  actionActivityNames: IItemListActivityName = {};

  @Input() chartData: ChartData;
  @Output() done = new EventEmitter<DialogResult>();
  @Output() targetOverlay = new EventEmitter<any>();

  @ViewChild(NewGoalComponent) newGoalComponent: NewGoalComponent;
  @ViewChild(EditGoalComponent) editGoalComponent: EditGoalComponent;
  @ViewChild(MilestonesComponent) milestonesComponent: MilestonesComponent;

  @ViewChild('listModal') listModal: ModalComponent;

  @ViewChild('tableContainer') tableContainer: ElementRef;

  target: any;

  stackList: SelectionItem[];
  nonStackList: SelectionItem[];

  selectedTarget: any;
  targetList: any[];
  listOfTargets: any[];

  mode: string;
  prevMode: string;
  chartHelper: any;

  searchString: string;
  tableHeight;

  private _subscription: Subscription[] = [];

  constructor(private _apollo: Apollo,
              private _targetService: TargetService,
              private _milestoneService: MilestoneService,
              private _cdr: ChangeDetectorRef,
              private _apolloService: ApolloService,
              private _router: Router,
              private _route: ActivatedRoute,
              public vm: SetGoalsViewModel,
              public addTargetActivity: AddTargetActivity,
              public updateTargetActivity: UpdateTargetActivity,
              public deleteTargetActivity: DeleteTargetActivity) {
            this.actionActivityNames = {
                edit: this.updateTargetActivity.name,
                delete: this.deleteTargetActivity.name
            };
  }

  ngOnInit() {
     const that = this;
        if (!this.vm.initialized) {
            this.vm.initialize(null);
            this.vm.addActivities([this.addTargetActivity, this.updateTargetActivity, this.deleteTargetActivity]);
            this._refreshTargets();
        }
        this._subscription.push(this._route.queryParams.subscribe(p => {
            if (p.refresh) {
                that._refreshTargets();
            }
        }));
  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  ngAfterViewInit() {
    this.chartHelper = {
      id: this.chartData._id,
      frequency: this.chartData.frequency,
      dateRange: this.chartData.dateRange[0],
      title: this.chartData.title
    };
    this._cdr.detectChanges();
  }

  onTarget(result: any) {
    switch (result.click) {
      case 'save':
        this.done.emit(DialogResult.OK);
        break;
      case 'cancel':
        this.done.emit(DialogResult.CANCEL);
        break;
      case 'list':
        if (this.targetList.length > 1) {
          this.setMode('view');
          setTimeout(() => {
            this.listModal.open();
          }, 100);
        } else {
          const id = this.targetList[0]._id;
          this.edit(id);
        }
        break;
    }

    if (result.click !== 'list') {
      this.setMode(result.mode);
    }
  }

  setMode(mode: string): void {
    this.mode = mode ? mode : this.prevMode;
  }

  updateTarget(targets) {
    this.targetList = targets;
    this.mode = this.targetList.length ? 'view' : '_new';
    this.prevMode = this.mode;
  }

  add() {
    this.prevMode = this.mode;
    this.mode = '_new';
    const that = this;
    this.newGoalComponent.open();
  }

  close() {
    this.listModal.close();
  }

  actionClicked(item: IActionItemClickedArgs) {
        switch (item.action.id) {
            case 'edit':
                this.edit(item.item.id);
                break;
            case 'delete':
                 this.delete(item.item.id);
                break;
            case 'milestones':
                this.listModal.close();
                this.listMilestones(item.item.id);
               break;
        }
    }

  editClickedList($event) {
    if ($event.itemType === 'standard') {
        this.edit($event.item.id);
    }
    return;
  }

  private edit(id) {
    const that = this;
    this.targetList.map(element => {
      if (element._id === id) {
        this.mode = 'edit';
        this.editGoalComponent.open();
        const formFields = {
          name: element.name,
          datepicker: moment(element.datepicker).format('MM/DD/YYYY'),
          vary: element.vary,
          period: element.period,
          active: element.active,
          amount: element.amount,
          amountBy: element.amountBy,
          notify: element.notify,
          visible: element.visible,
          stackName: element.stackName ? element.stackName.replace(/,/g, '') : element.stackName,
          nonStackName: element.nonStackName ? element.nonStackName.replace(/,/g, '') : element.nonStackName
        };

        this.selectedTarget = {
          id: element._id,
          form: formFields,
          target: element
        };

        if (this.selectedTarget.form &&
          this.selectedTarget.form.nonStackName &&
          this.selectedTarget.form.nonStackName === 'All') {
            this.selectedTarget.form.nonStackName = 'all';
        }

        this.editGoalComponent.updateEditForm(this.selectedTarget);
      }
    });
  }

  listMilestones(id) {
    this.targetList.map(t => {
      if (t._id === id) {

        this.prevMode = this.mode;
        this.mode = 'milestones';

        this.milestonesComponent.hasUpdateMilestone = false;
        this.selectedTarget = {
          id: t._id,
          name: t.name
        };

        this.milestonesComponent.getMilestoneList(this.selectedTarget);
      }});
  }

  private delete(id) {
    const that = this;
   this.targetList.map(t => {
     if (t._id === id) {
       SweetAlert({
        title: 'Are you sure?',
        text: 'Once deleted, you will not be able to recover this target',
        type: 'warning',
        showConfirmButton: true,
        showCancelButton: true
      }).then(willDelete => {
        if (willDelete.value === true) {
          this._subscription.push(this._apollo.mutate({
              mutation: targetApi.remove,
              variables: {
                  id: t._id,
                  owner: t.owner
              },
              refetchQueries: ['Chart']
          })
          .subscribe(({data}) => {
              const deletedTarget = (<any>data).removeTarget;
              if (deletedTarget.success) {
                that.targetList = this.targetList.filter(val => val._id !== deletedTarget.entity._id);
                that.updateTarget(this.targetList);

                that.targetOverlay.emit({mode: that.$mode, refresh: true});
              }
          }));
        }
      });
     }
   });
  }

  get $mode() {
    return this.mode;
  }

  stackCategories(categories: any, nonStackChartName?: any) {
    this.stackList = categories;
    this.nonStackList = nonStackChartName;
  }

  open() {
    if (this.mode === 'edit' && this.editGoalComponent) {
      this.editGoalComponent.open();
    }
    if (this.mode === '_new' && this.newGoalComponent) {
      this.newGoalComponent.open();
    }
    if (this.mode === 'view' && this.listModal) {
      this.listModal.open();
    }
  }

  modalClose() {
    this.listModal.close();
  }

  isModeNew() {
    return this.mode === '_new';
  }

  isModeEdit() {
    return this.mode === 'edit';
  }

  isModeView() {
    return this.mode === 'view';
  }

  isMileStones() {
    return this.mode === 'milestones';
  }

  private _refreshTargets(refresh ?: boolean) {
      const that = this;
      this.targetList = this.chartData.targetList;

      this.mode = this.targetList.length ? 'view' : '_new';
      this.prevMode = this.mode;
        that.vm.targets = this.targetList;
  }

}


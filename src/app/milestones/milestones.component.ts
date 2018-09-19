import { IUserInfo } from '../shared/models';
import { ViewMilestoneActivity } from '../shared/authorization/activities/milestones/view-milestone.activity';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { join, isEmpty } from 'lodash';
import { Subscription } from 'rxjs/Subscription';
import SweetAlert from 'sweetalert2';

import { ModalComponent } from '../ng-material-components';
import { AddMilestoneActivity } from '../shared/authorization/activities/milestones/add-milestone.activity';
import { DeleteMilestoneActivity } from '../shared/authorization/activities/milestones/delete-milestone.activity';
import { ModifyMilestoneActivity } from '../shared/authorization/activities/milestones/modify-milestone.activity';
import { Activity } from '../shared/authorization/decorators/component-activity.decorator';
import { IItemListActivityName } from '../shared/interfaces/item-list-activity-names.interface';
import { CommonService } from '../shared/services';
import { ApolloService } from '../shared/services/apollo.service';
import { IActionItemClickedArgs } from '../shared/ui/lists/item-clicked-args';
import { AddMilestoneComponent } from './add-milestone/add-milestone.component';
import { MilestonesViewModel } from './milestones.viewmodel';
import { IMilestone } from './shared/milestones.interface';
import { MilestoneService } from './shared/services/milestone.service';
import { UpdateMilestoneComponent } from './update-milestone/update-milestone.component';



const usersQueryGql = require('graphql-tag/loader!./users.query.gql');
const milestoneById = require('graphql-tag/loader!./get-milestone-by-id.query.gql');

const allMilestonesGql = require('graphql-tag/loader!./get-milestones-by-target.query.gql');
const removeMilestoneGql = require('graphql-tag/loader!./remove-milestone.mutation.gql');

@Activity(ViewMilestoneActivity)
@Component({
    selector: 'kpi-milestones',
    templateUrl: './milestones.component.pug',
    styleUrls: ['./milestones.component.scss'],
    providers: [MilestonesViewModel, AddMilestoneActivity, ModifyMilestoneActivity, DeleteMilestoneActivity]
})
export class MilestonesComponent implements OnInit, OnDestroy {
    actionActivityNames: IItemListActivityName = {};

    @Input() selectedTarget: any;
    @Output() done = new EventEmitter < any > ();

    @ViewChild('listModal') listModal: ModalComponent;
    @ViewChild('milestoneTable') milestoneTable: any;
    @ViewChild('tableContainer') tableContainer: ElementRef;

    @ViewChild(AddMilestoneComponent) addMilestoneComponent: AddMilestoneComponent;
    @ViewChild(UpdateMilestoneComponent) updateMilestoneComponent: UpdateMilestoneComponent;

    fg: FormGroup = new FormGroup({});
    milestone: any;
    milestoneItems: any[] = [];
    usersItem: any;

    selectedMilestone: any;

    isCollapsedTargetForm = false;
    isCollapsedNotifyTarget = true;
    isCollapsedVisibleTarget = true;

    mode: string;
    hasUpdateMilestone = false;

    responsibles = [];

    searchString: string;
    tableHeight;
    listOfMileStones: any[];

    private _subscription: Subscription[] = [];

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this._setTableHeight();
    }

    constructor(private _milestoneService: MilestoneService,
        private _apollo: Apollo,
        private _apolloService: ApolloService,
        private _router: Router,
        private _route: ActivatedRoute,
        public vm: MilestonesViewModel,
        public addMilestoneActivity: AddMilestoneActivity,
        public modifyMilestoneActivity: ModifyMilestoneActivity,
        public deleteMilestoneActivity: DeleteMilestoneActivity) {
        this.actionActivityNames = {
            edit: this.modifyMilestoneActivity.name,
            delete: this.deleteMilestoneActivity.name
        };
    }

    ngOnInit() {
        const that = this;

        if (!this.vm.initialized) {
            this.vm.initialize(null);
            this.vm.addActivities([this.addMilestoneActivity, this.modifyMilestoneActivity, this.deleteMilestoneActivity]);
            this._refreshMilestones();
        }
        this._route.queryParams.subscribe(p => {
            if (p.refresh) {
                that._refreshMilestones();
            }
        });
        this.setResponsibleList();
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    setResponsibleList() {
        const that = this;
        that._milestoneService.resetResponsibleList();

        this._subscription.push(
            this._apollo.query({
                query: usersQueryGql,
                fetchPolicy: 'network-only'
            }).subscribe(({
                data
            }) => {
                const responsiblesQuery = ( < any > data).allUsers;
                responsiblesQuery.forEach(item => {
                    const responsible = this._setResponsibleUser(item);
                    that._milestoneService.setResponsibleList(item._id, responsible, false);
                });
            })
        );
    }

    getResponsibleName(responsible) {
        if (!responsible || !Array.isArray(responsible)) {
            return;
        }
        const responsibles = [];
        responsible.map(r => {
            responsibles.push(r.firstName + ' ' + r.lastName);
        });
        return responsibles;
    }

    setTargets(targets: any[]): void {
        if (!isEmpty(targets) && Array.isArray(targets) && targets.length) {
            this._milestoneService.setTarget(targets);
        }
    }

    getMilestoneList(selectedTarget: any) {
        if (!selectedTarget) {
            return;
        }
        const that = this;
        let queryCount = 0;

        this._subscription.push(
            this._apollo.watchQuery({
                query: allMilestonesGql,
                variables: {
                    target: selectedTarget.id,
                },
                fetchPolicy: 'network-only'
            })
            .valueChanges.subscribe(({
                data
            }) => {
                queryCount += 1;
                if (that.hasUpdateMilestone) {
                    const updatedMilestones = that.milestoneItems;
                    that.milestoneItems = updatedMilestones;
                    that.vm.milestones = updatedMilestones;
                    return;
                }
                const milestoneQuery = ( < any > data).milestonesByTarget;
                that.milestoneItems = milestoneQuery;
                that.vm.milestones = milestoneQuery;
                that.mode = (that.milestoneItems && that.milestoneItems.length) ? 'viewMilestone' : 'add';

                if (queryCount === 1) {
                    that.open();
                }

            }));
    }

    onMilestone(result: any) {
        this.mode = result.mode;
        this.hasUpdateMilestone = result.update;
        this.done.emit({
            click: 'save',
            mode: this.mode
        });
    }

    actionClicked(item: IActionItemClickedArgs) {
        switch (item.action.id) {
            case 'edit':
                this.edit(item.item.id);
                break;
            case 'delete':
                this.delete(item.item.id);
                break;
            case 'see-target':
                this.listModal.close();
                this.done.emit({
                    click: 'list',
                    mode: 'view'
                });
                break;
        }
    }

    add() {
        this.mode = 'add';
        this.listModal.close();
        this.addMilestoneComponent.open();
    }

    editClickedList($event) {
        if ($event.itemType === 'standard') {
            this.edit($event.item.id);
        }
        return;
    }

    edit(id) {
        this.responsibles = [];
        const that = this;
        this._apolloService.networkQuery < IMilestone > (milestoneById, {
            id: id
        }).then(result => {
            that.milestone = result.milestoneById;
            that.milestone.responsible.map(r => {
                that.responsibles.push(r._id);

                const formField = {
                    target: that.milestone.target,
                    task: that.milestone.task,
                    dueDate: that.milestone.dueDate,
                    _status: that.milestone.status,
                    responsible: join(that.responsibles, '|')
                };

                that.selectedMilestone = {
                    _id: that.milestone._id,
                    form: formField
                };

                that._milestoneService.setEditMilestone(that.selectedMilestone);
            });

            if (that.milestone) {
                that.mode = 'update';
                that._openEditModal();
            }
        });

    }

    delete(id) {
        const that = this;

        SweetAlert({
            title: 'Are you sure?',
            text: 'Once deleted, you will not be able to recover this milestone',
            type: 'warning',
            showConfirmButton: true,
            showCancelButton: true
        }).then((res) => {
            if (res.value === true) {
                that._apolloService.mutation < {
                        deleteMiestone: {
                            success: boolean
                        }
                    } > (removeMilestoneGql, {
                        _id: id
                    })
                    .then(result => {
                        if (result.data.deleteMilestone.success) {
                            that.milestoneItems = that.milestoneItems.filter(val => val._id !== result.data.deleteMilestone.entity._id);
                            that._setUpdatedMilestone(true);
                            that.done.emit({
                                click: 'cancel',
                                mode: 'view'
                            });
                            that._refreshMilestones();
                        }
                    });
            }
        });

    }

    close() {
        this.listModal.close();
        this._setUpdatedMilestone(false);
        this.done.emit({
            click: 'cancel',
            mode: null
        });
    }

    modalClose(): void {
        this.listModal.close();
    }

    open() {
        if (this.isModeAdd() &&
            this.addMilestoneComponent) {
            this.addMilestoneComponent.open();
            return;
        }
        if (this.isModeUpdate() &&
            this.updateMilestoneComponent) {
            this.updateMilestoneComponent.open();
            return;
        }
        if (this.isModeView() &&
            this.listModal &&
            !(<any>this.listModal).visible) {
            this.listModal.open();
            return;
        }
    }

    isModeAdd() {
        return this.mode === 'add';
    }

    isModeUpdate() {
        return this.mode === 'update';
    }

    isModeView() {
        return this.mode === 'viewMilestone';
    }

    private _setTableHeight(): void {
        if (this.tableContainer) {
            this.tableHeight = this.tableContainer.nativeElement.offsetHeight - 70;
        }
    }


    private _setUpdatedMilestone(hasUpdate: boolean) {
        this.hasUpdateMilestone = hasUpdate;
    }

    private _refreshMilestones(refresh ?: boolean) {
        const that = this;
        that._milestoneService.resetResponsibleList();
        this._apolloService.networkQuery < IMilestone[] > (usersQueryGql).then(m => {
            const responsiblesQuery = m.allUsers;
            responsiblesQuery.forEach(item => {
                const responsible = that._setResponsibleUser(item);
                that._milestoneService.setResponsibleList(item._id, responsible, false);
            });

        });
    }

    private _openEditModal(): void {
        if (this.listModal && (<any>this.listModal).visible) {
            this.listModal.close();
        }
        this.updateMilestoneComponent.open();
    }

    private _setResponsibleUser(item: IUserInfo): string {
        let name = '';
        if (!isEmpty(item.profile) && item.profile.firstName) {
            name = item.profile.firstName + ' ' + item.profile.lastName;
        } else {
            name = item.username;
        }
        return name;
    }
}

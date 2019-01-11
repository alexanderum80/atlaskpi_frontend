import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import SweetAlert from 'sweetalert2';

import { ChartData } from '../../charts/shared';
import { ModalComponent } from '../../ng-material-components';
import { ITarget } from '../shared/models/target';
import { IBasicUser } from '../shared/models/target-user';
import { TargetScreenService } from '../shared/services/target-screen.service';
import { UserService } from '../../shared/services';
import { Subscription } from 'rxjs/Subscription';
import { IUserInfo } from '../../shared/models';
import * as moment from 'moment';

const targetsQuery = require('graphql-tag/loader!./list-targets.gql');
const usersQuery = require('graphql-tag/loader!./get-users.query.gql');
const createTarget = require('graphql-tag/loader!./create-target.mutation.gql');
const updateTarget = require('graphql-tag/loader!./update-target.mutation.gql');
const removeTarget = require('graphql-tag/loader!./remove-target.mutation.gql');

@Component({
    selector: 'app-targets-screen',
    templateUrl: './targets-screen.component.pug',
    styleUrls: ['./targets-screen.component.scss'],
    providers: [ TargetScreenService ],
})
export class TargetsScreenComponent implements OnInit {
    @Input()
    chart: ChartData;

    @ViewChild('targetModal')
    modal: ModalComponent;

    @Output()
    closed = new EventEmitter();

    ready$: Observable<boolean>;
    private _subscription: Subscription[] = [];
    currentUser: IUserInfo;
    constructor(
        private apollo: Apollo,
        public model: TargetScreenService,
        private _userService: UserService
    ) {
        const that = this;
        this._subscription.push(this._userService.user$.subscribe((user) => {
            that.currentUser = user;
        }));
    }

    ngOnInit() {
        this.model.initialize(this.chart);
        this.ready$ = this.loadDependencies();
    }

    close() {
        this.closed.emit();
    }

    cancel() {
        if (this.model.form.dirty) {
            if (this.model.form.value._id) {
                this.model.selectTarget(this.model.selected);
            } else {
                this.model.form.reset();
            }
        } else {
            this.modal.close();
        }
    }

    async save() {
        const data = this.model.getData();
        const mutation = data._id ? updateTarget : createTarget;
        const dataBy: ITarget = {
            _id: data._id,
            name: data.name,
            source: data.source,
            compareTo: data.compareTo,
            type: data.type,
            unit: data.unit,
            value: data.value,
            appliesTo: data.appliesTo,
            active: data.active,
            notificationConfig: data.notificationConfig,
            milestones: data.milestones,
            createdBy: this.currentUser._id,
            updatedBy: this.currentUser._id,
            createdDate: moment().toDate(),
            updatedDate: moment().toDate()
        };
        
        if (!data._id) {
            data.updatedBy = this.currentUser._id;
            data.createdBy = this.currentUser._id;
            data.createdDate = moment().toDate();
            data.updatedDate = moment().toDate();
        } else {
            data.updatedBy = this.currentUser._id;
            data.updatedDate = moment().toDate();
            delete data.createdBy;
            delete data.createdDate;
        }
        const variables = data._id ? { _id: data._id, data } : { data };

        delete data._id;
        const res = await this.apollo.mutate({ mutation, variables }).toPromise();
        const result = dataBy._id ? res.data.updateTargetNew : res.data.createTargetNew;
        this.model.form.markAsPristine();
        if (res.data.createTargetNew && res.data.createTargetNew.success) {
            this.model.updateNewModel(result.entity._id);
        }

        this.closed.emit();
    }

    async remove(target: ITarget) {
        const confirmed = await this.confirmRemoval();

        if (!confirmed) { return; }

        const res = await this.apollo.mutate({ mutation: removeTarget, variables: { id: target._id } })
            .toPromise();
        this.model.removeTarget(target);
    }

    private loadDependencies() {
        return combineLatest(
            this.apollo.query<{ targetBySource: ITarget[] }>({
                query: targetsQuery,
                fetchPolicy: 'network-only',
                variables: { source: { identifier: this.chart._id } },
            }),
            this.apollo.query<{ allUsers: IBasicUser[] }>({
                query: usersQuery,
                fetchPolicy: 'network-only',
            }),
        ).pipe(
            filter(([targets, users]) => {
                return targets.data.targetBySource !== undefined
                    && users.data.allUsers !== undefined;
            }),
            tap(([targets, users]) => {
                this.model.targetList = targets.data.targetBySource.slice(0);
                this.model.userList = users.data.allUsers;

                // assign an empty target or the first one
                const target = !this.model.targetList.length ? null : this.model.targetList[0];

                if (!target) {
                    this.model.addTarget();
                } else {
                    this.model.selectTarget(target);
                }

            }),
            map(_ => true),
        );
    }

    private async confirmRemoval(): Promise<boolean> {
        const res = await SweetAlert({
            title: 'Are you sure?',
            text: `You are about to lose the changes you made to the current target. Do you want to continue?`,
            type: 'warning',
            showConfirmButton: true,
            showCancelButton: true
        });

        return res.value;
    }
}

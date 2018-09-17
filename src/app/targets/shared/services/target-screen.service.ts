import { Injectable } from '@angular/core';
import { isEmpty } from 'lodash';
import SweetAlert from 'sweetalert2';

import { ChartData } from '../../../charts/shared';
import { FormBuilderTypeSafe, FormGroupTypeSafe, UserService } from '../../../shared/services';
import { IListItem } from '../../../shared/ui/lists/list-item';
import { getNewTarget, ITarget } from '../models/target';
import { TargetFormModel } from '../models/target-form.model';
import { FrequencyEnum } from '../../../shared/models';
import { IBasicUser } from '../models/target-user';
import { select } from 'async';


@Injectable()
export class TargetScreenService {

    private _targetList: ITarget[];
    set targetList(val: ITarget[]) {
        // val.map(t => {
        //     if (t.milestones) {
        //         t.milestones.forEach(m => {
        //             if (m.dueDate) {
        //                 m.dueDate = new Date(m.dueDate);
        //             }
        //         });
        //     }
        // });
        this._targetList = val;
    }
    get targetList(): ITarget[] {
        return this._targetList;
    }

    objectiveList: IListItem[] = [
        { id: 'increase', title: 'Increase' },
        { id: 'decrease', title: 'Decrease' },
        { id: 'fixed', title: 'Fixed' },
    ];
    baseOnList: IListItem[];
    displayForField: boolean;

    get userList(): IBasicUser[] {
        return this._userList;
    }
    set userList(users: IBasicUser[]) {
        this._userList = users;
        this._userItemList = users.map(u => ({
            id: u._id,
            title: `${u.profile.firstName} ${u.profile.lastName}`,
        }));
    }
    get userItemList(): IListItem[] {
        return this._userItemList;
    }

    private _userList: IBasicUser[];
    private _userItemList: IListItem[];
    private _formModel: TargetFormModel;
    private _selected: ITarget;
    private chart: ChartData;

    get selected(): ITarget {
        return this._selected;
    }

    constructor(
        private builder: FormBuilderTypeSafe,
        private userService: UserService,
    ) { }

    initialize(chart: ChartData) {
        this.chart = chart;
        this.displayForField = !isEmpty(this.chart.xAxisSource) && this.chart.xAxisSource !== 'frequency';
        this.baseOnList = this.getBasedOnList();

        this._formModel = new TargetFormModel(this.builder);
    }

    get isEmpty(): boolean {
        return this.targetList.length === 0;
    }

    get form(): FormGroupTypeSafe<ITarget> {
        return this._formModel.form;
    }

    getData() {
        const v = this._formModel.form.value;

        return {
            _id: v._id,
            name: v.name,
            source: {
                identifier: this.chart._id,
                type: 'chart'
            },
            compareTo: v.compareTo,
            type: v.type,
            unit: v.unit,
            value: +(v.value.toString().replace(',', '')) || 0,
            appliesTo: v.appliesTo,
            active: Boolean(v.active),
            notificationConfig: {
                users: v.notificationConfig.users.map(u => {
                    const tu = { identifier: u.identifier, deliveryMethods: [] };
                    if (u.email) { tu.deliveryMethods.push('email'); }
                    if (u.push) { tu.deliveryMethods.push('push'); }
                    return tu;
                })
            },
            milestones: v.milestones.map(m => ({
                task: m.task,
                dueDate: new Date(m.dueDate).toISOString() as any,
                responsible: typeof m.responsible === 'string' ? (<string>m.responsible).split('|') : m.responsible,
                status: m.status
            })),
        } as ITarget;
    }

    addTarget() {
        const newTarget = getNewTarget(this.userService.user._id);
        this.targetList.push(newTarget);
        this.selectTarget(newTarget);
    }

    removeTarget(target: ITarget) {
        const idx = this.targetList.findIndex(t => t === target);
        this.targetList.splice(idx, 1);

        if (this.selected === target) {
            this.form.reset();

            if (this.targetList.length > 0) {
                this._selected = this.targetList[0];
                this._formModel.update(this._selected);
            } else {
                this.addTarget();
            }
        }
    }

    async selectTarget(target?: ITarget) {
        if (!target) { return; }

        if (this.form.dirty) {
            const result = await this.confirmFormReset();
            if (!result) { return; }

            // remove target if it is new
            if (!this.form.value._id) {
                this.removeTarget(this.selected);
            } else {
                // restore original values
                this._formModel.update(this.selected);
                this.form.markAsPristine();
            }

        }

        const t = this.targetList.find(i => i === target);
        this._selected = t;
        this._formModel.update(target);
    }

    addNewUser() {
        this._formModel.addUser();
    }

    removeUser(index: number) {
        this._formModel.removeUser(index);
    }

    addMilestone() {
        this._formModel.addMilestone();
    }

    removeMilestone(index: number) {
        this._formModel.removeMilestone(index);
    }

    updateNewModel(id: string) {
        this._formModel.form.getSafe(f => f._id).setValue(id);
        const target = this.targetList.find(t => t === this.selected);
        Object.assign(target, this._formModel.form.value);
        this._formModel.form.markAsPristine();
        this.selectTarget(target);
    }

    private getBasedOnList(): IListItem[] {
        const getList = (name: string) => {
            const lower = name.toLowerCase();
            return [
                { id: `last ${lower}`, title: `Last ${name}` },
                { id: `same ${lower} last year`, title: `Same ${name}, last year` },
                { id: `same ${lower} 2 years ago`, title: `Same ${name}, 2 years ago` },
            ];
        };

        if (this.chart.frequency) {
            switch (this.chart.frequency) {
                // do not support daily frequency on targets for now
                // case FrequencyEnum.Daily:
                //     break;
                case FrequencyEnum.Monthly:
                    return getList('Month');
                case FrequencyEnum.Quartely:
                    return getList('Quarter');
                case FrequencyEnum.Weekly:
                    return getList('Week');
                case FrequencyEnum.Yearly:
                    const lower = 'year';
                    return [
                        { id: `last ${lower}`, title: `Last Year` },
                        { id: `two years ago`, title: `Two years ago` },
                        { id: `three years ago`, title: `Three years ago` },
                    ];
            }
        }
    }

    private async confirmFormReset(): Promise<boolean> {
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

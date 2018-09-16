import { Injectable } from '@angular/core';
import { isEmpty } from 'lodash';

import { ChartData } from '../../../charts/shared';
import { FormBuilderTypeSafe, FormGroupTypeSafe, UserService } from '../../../shared/services';
import { IListItem } from '../../../shared/ui/lists/list-item';
import { getNewTarget, ITarget } from '../models/target';
import { TargetFormModel } from '../models/target-form.model';
import { FrequencyEnum } from '../../../shared/models';
import { IBasicUser } from '../models/target-user';


@Injectable()
export class TargetScreenService {

    targetList: ITarget[];
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

    selectTarget(target?: ITarget) {
        if (!target) {
            target = getNewTarget(this.userService.user._id);
        }

        const t = this.targetList.find(i => i.id === target.id);
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

}

import { Injectable } from '@angular/core';

import { ChartData } from '../../../charts/shared';
import { FormBuilderTypeSafe, FormGroupTypeSafe, UserService } from '../../../shared/services';
import { IListItem } from '../../../shared/ui/lists/list-item';
import { getNewTarget, ITarget } from '../models/target';
import { TargetFormModel } from '../models/target-form.model';


@Injectable()
export class TargetScreenService {

    targetList: ITarget[];
    objectiveList: IListItem[] = [
        { id: 'increase', title: 'Increase' },
        { id: 'decrease', title: 'Decrease' },
        { id: 'fixed', title: 'Fixed' },
    ];
    targetPeriodList: IListItem[];
    baseOnList: IListItem[];

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

        this._formModel = new TargetFormModel(this.builder);
        this.targetPeriodList = this.getTargetPeriodList();
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

    private getTargetPeriodList(): IListItem[] {
        if (this.chart.frequency) {

        } else {

        }
    }

}

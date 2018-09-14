// import { ITarget, DeliveryMethodEnum, getNewTarget } from './target';
// import { TargetFormModel } from './target-form.model';
// import { FormBuilderTypeSafe, FormGroupTypeSafe } from '../../../shared/services';
// import { IListItem } from '../../../shared/ui/lists/list-item';
// import { IUserInfo } from '../../../shared/models';
// import { ChartData } from '../../../charts/shared';

// export class TargetScreenModel {

//     targetList: ITarget[];
//     objectiveList: IListItem[] = [
//         { id: 'increase', title: 'Increase' },
//         { id: 'decrease', title: 'Decrease' },
//         { id: 'fixed', title: 'Fixed' },
//     ];
//     targetPeriodList: IListItem[];
//     baseOnList: IListItem[];

//     private _formModel: TargetFormModel;
//     private _selected: ITarget;

//     get selected(): ITarget {
//         return this._selected;
//     }

//     constructor(
//         builder: FormBuilderTypeSafe,
//         private chart: ChartData,
//         private user: IUserInfo,
//     ) {
//         this._formModel = new TargetFormModel(builder);
//         this.targetPeriodList = this.getTargetPeriodList();
//     }

//     get isEmpty(): boolean {
//         return this.targetList.length === 0;
//     }

//     get form(): FormGroupTypeSafe<ITarget> {
//         return this._formModel.form;
//     }

//     selectTarget(target?: ITarget) {
//         if (!target) {
//             target = getNewTarget(this.user._id);
//         }

//         const t = this.targetList.find(i => i.id === target.id);

//         this._selected = t;

//         this._formModel.update(target);
//     }

//     private getTargetPeriodList(): IListItem[] {
//         if (this.chart.frequency) {

//         } else {

//         }
//     }

// }

import { UserService } from '../../shared/services/user.service';
import { IUserInfo } from '../../shared/models/user';
import { Field, ViewModel } from '../../ng-material-components/viewModels';
import { Injectable } from '@angular/core';
import { IDepartment } from '../shared/models/department.model';
import { IListItem } from '../../shared/ui/lists/list-item';

export interface IFilter {
    search: string;
}

@Injectable()
export class ListDepartmentsViewModel extends ViewModel<IFilter> {
    private _departments: IDepartment[];
    private _departmentItemList: IListItem[];
    protected _user: IUserInfo;

    constructor(userService: UserService) {
        super(userService);
    }

    get departments(): IDepartment[] {
        return this._departments;
    }

    set departments(list: IDepartment[]) {
        if (list === this._departments) {
            return;
        }

        this._departments = list;
        this._departmentItemList = this._departments.map(d => ({
            id: d._id,
            imagePath: '/assets/img/pages/department.png',
            title: d.name,
            subtitle: d.manager
        }));
    }

    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }

    get departmentItems(): IListItem[] {
        if (!this._departmentItemList || this._departmentItemList.length === 0) {
            return null;
        }

        return this._departmentItemList;
    }

}

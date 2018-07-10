// Angular Imports
import { IUserInfo } from '../../shared/models/user';
import { UserService } from '../../shared/services/user.service';
import {
    Injectable
} from '@angular/core';

// App Code
import {
    Field,
    ViewModel
} from '../../ng-material-components/viewModels';
import {
    IEmployee
} from '../shared/models/employee.model';
import { IListItem } from '../../shared/ui/lists/list-item';

interface IFilter {
    search: string;
}

@Injectable()
export class ListEmployeesViewModel extends ViewModel<IFilter> {
    private _employees: IEmployee[];
    private _employeeItemList: IListItem[];

    get employees(): IEmployee[] {
        return this._employees;
    }

    set employees(list: IEmployee[]) {
        if (list === this._employees) {
            return;
        }

        this._employees = list;
        this._employeeItemList = this._employees.map(d => {
            return {
                id: d._id,
                imagePath: '/assets/img/employees/employee.png',
                title: d.firstName + ' ' + d.lastName,
                subtitle: d.email
            };
        });
    }

    get employeeItems(): IListItem[] {
        return this._employeeItemList;
    }

    @Field({ type: String })
    search: string;

    protected _user: IUserInfo;

    constructor(userService: UserService) {
        super(userService);
    }

    initialize(model: IFilter): void {
        this.onInit(model);
    }

}

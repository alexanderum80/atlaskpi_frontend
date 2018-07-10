import { UserService } from '../../shared/services/user.service';
import { IUserInfo } from '../../shared/models/user';
import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { Injectable } from '@angular/core';

@Injectable()
export class WidgetViewViewModel extends ViewModel<any> {
    protected _user: IUserInfo;

    constructor(userService: UserService) {
        super(userService);
    }

    public initialize(model: any): void {
        this.onInit(model);
    }
}

import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { IWidget } from '../shared/models/index';
import { UserService } from '../../shared/services/user.service';
import { IUserInfo } from '../../shared/models/user';
import { Injectable } from '@angular/core';


@Injectable()
export class NoWidgetViewModel extends ViewModel<IWidget> {
    protected _user: IUserInfo;

    constructor(userService: UserService) {
        super(userService);
    }

    initialize(model: IWidget) {
        this.onInit(model);
    }
}

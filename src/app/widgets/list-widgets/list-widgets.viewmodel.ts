import { UserService } from '../../shared/services/user.service';
import { IUserInfo } from '../../shared/models/user';
import { IWidget } from '../shared/models/index';
import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { Injectable } from '@angular/core';

@Injectable()
export class ListWidgetsViewModel extends ViewModel<IWidget> {
    protected _user: IUserInfo;

    constructor(userService: UserService) {
        super(userService);
    }

    initialize(model: IWidget): void {
        this.onInit(model);
    }
}

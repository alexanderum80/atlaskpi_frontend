import { IUserInfo } from '../../shared/models/user';
import { UserService } from '../../shared/services/user.service';
import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { Injectable } from '@angular/core';

export class ListChartSlideShowViewModel extends ViewModel<any> {
    protected _user: IUserInfo;

    constructor(userService: UserService) {
        super(userService);
    }

    public initialize(model: any): void {
        this.onInit(model);
    }
}

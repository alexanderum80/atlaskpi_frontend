import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { UserService } from '../../shared/services/user.service';
import { Injectable } from '@angular/core';

@Injectable()
export class HeaderViewModel extends ViewModel<any> {
    constructor(userService: UserService) {
        super(userService);
    }

    initialize(model: any) {
        this.onInit(model);
    }
}

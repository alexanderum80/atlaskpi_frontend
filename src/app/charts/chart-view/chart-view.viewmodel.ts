import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { UserService } from '../../shared/services/user.service';
import { Injectable } from '@angular/core';

export interface IRunRate {
    name: string;
    colorIndex: number;
    data: number;
}

@Injectable()
export class ChartViewViewModel extends ViewModel<any> {

    private _runRateList: IRunRate[] = [];
    private _seriesBack: any[];

    constructor(userService: UserService) {
        super(userService);
    }

    initialize(model: any) {
        this.onInit(model);
    }

    get runRateList() {
        return this._runRateList;
    }

    set runRateList(value: any) {
        this._runRateList = value;
    }

    get seriesBack() {
        return this._seriesBack;
    }

    set seriesBack(value: any) {
        this._seriesBack = value;
    }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { MenuItem } from '../../ng-material-components';

@Injectable()
export class AppStateService {

    private appState: {
        headerActions: MenuItem[],
    };

    private _headerActions: Subject<MenuItem[]>;

    get headerActions$(): Observable<MenuItem[]> {
        return this._headerActions.asObservable();
    }

    changeHeaderActions(actions: MenuItem[]) {
        this.appState.headerActions = actions;
        this._headerActions.next(this.appState.headerActions);
    }
}

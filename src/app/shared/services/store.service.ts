import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MenuItem } from '../../ng-material-components';
import { IAppEvent } from '../models';
import 'rxjs/add/operator/distinctUntilChanged';

export interface State {
  hideLayout: boolean;
  sideBarOpen: boolean;
  headerActions: MenuItem[];
  theme: string;
  inDemoMode?: boolean;
  previousRoute?: string;
  selectedAppointmentsProvider?: string;
  showAppointmentCancelled?: boolean;
  showHelpCenter: boolean;
}

const defaultState = {
  hideLayout: false,
  sideBarOpen: false,
  headerActions: [],
  theme: 'light',
  selectedAppointmentsProvider: '',
  showHelpCenter: false
};


export interface IAppDataObject {
  id: string;
  data: any;
}

const _store = new BehaviorSubject<State>(defaultState);
const _actionsSubject = new Subject<IAppEvent>();

@Injectable()
export class Store {
  changes$: Observable<State>;
  appEvents$: Observable<IAppEvent>;

  // initially used for holding complex objects from one route to the other
  private _appData = { };

  private _store = _store;
  private _actionsSubject = _actionsSubject;

  constructor() {
    this.changes$ = this._store.asObservable().distinctUntilChanged();
    this.appEvents$ = this._actionsSubject.asObservable().distinctUntilChanged();
  }

  pushAppEvent(actionData: IAppEvent) {
      this._actionsSubject.next({
          type: actionData.type,
          data: actionData.data
      });
  }

  setState(state: State) {
    this._store.next(state);
  }

  getState(): State {
    return this._store.value;
  }

  purge() {
    this._store.next(defaultState);
  }

  pushDataObject(obj: IAppDataObject) {
    this._appData[obj.id] = obj.data;
  }

  pullDataObject(id: string): IAppDataObject {
    const obj = this._appData[id];
    if (obj) {
        delete this._appData[id];
        return obj;
    }
    return;
  }
}

import { Injectable } from '@angular/core';
import { pull } from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { IUser } from '../../../users/shared/models';
import { IChart } from '../models';
import { IMap } from '../../../maps/shared/models/map.models';

@Injectable()
export class SelectedChartsService {
  private _selectionSubject = new BehaviorSubject<IChart>(null);

  private _inspectorOpenSubject = new BehaviorSubject<boolean>(false);

  private _selectUsersSubject = new BehaviorSubject<IUser>(null);

  private selectedArray: string[] = [];

  private usersArray: string[] = [];

  private _existDuplicatedName: boolean;

  get selected$(): Observable<IChart> {
    return this._selectionSubject.asObservable();
  }

  get selectedCharts() {
    return this.selectedArray;
  }

  get selectedUsers() {
    return this.usersArray;
  }

  get inspectorOpen$(): Observable<boolean> {
    return this._inspectorOpenSubject.asObservable();
  }

  get dashboardUsers$() {
    return this._selectUsersSubject.asObservable();
  }

  getExistDuplicatedName() {
    return this._existDuplicatedName;
  }

  setActive(item: IChart) {
    if (!item) {
      return;
    }

    this._selectionSubject.next(item);
  }

  updateSelected(chart: string) {
    if (this.selectedArray.find(a => a === chart)) {
      pull(this.selectedArray, chart);
    } else {
      if (chart !== null) {
        this.selectedArray.push(chart);
      }
    }
  }

  updateUsers(user: string) {
    if (this.selectedUsers.find(u => u === user)) {
      pull(this.usersArray, user);
    } else {
      if (user !== null) {
        this.usersArray.push(user);
      }
    }
  }

  updateExistDuplicatedName(exist: boolean) {
    this._existDuplicatedName = exist;
  }

  setSelectedCharts(chart: string) {
    this.selectedArray.push(chart);
  }

  clearSelectedCharts() {
    this.selectedArray = [];
  }

  setSelectedUsers(user: string) {
    this.usersArray.push(user);
  }

  clearSelectedUsers() {
    this.usersArray = [];
  }

  showInspector() {
    this._inspectorOpenSubject.next(true);
  }

  hideInspector() {
    this._inspectorOpenSubject.next(false);
  }

}

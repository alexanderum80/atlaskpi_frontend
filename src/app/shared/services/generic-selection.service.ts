import { IdName } from './../models/idName';
import { Injectable } from '@angular/core';
import { pullAllBy, pull, sortBy, find } from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

export interface IGenericSelectionItem {
  id: string;
  type: string;
  payload: any;
  position?: any;
  validPosition?: boolean;
}

export class GenericSelectionItem implements IGenericSelectionItem {
  id: string;
  type: string;
  payload: any;
  position?: any;
  validPosition?: boolean;

  constructor(obj: any, type?: string, id?: string) {
    this.id = id || obj['id'] || obj['_id'] || obj['connectorId'] || null;
    this.type = type || typeof obj || null;
    this.payload = obj;
    this.position = obj.position;
    this.validPosition = true;
  }
}

@Injectable()
export class GenericSelectionService {

  private _multiSelect = false;
  public _selectionList: IGenericSelectionItem[] = [];
  private _selectionListSubject = new BehaviorSubject<IGenericSelectionItem[]>([]);
  private _allowDisableSelection = true;

  constructor() {
    // firing on each injection
    console.log('New Generic Selection Service instance...');
  }

  enableMultiSelect() {
    this._multiSelect = true;
  }

  disableMultiSelect() {
    this._multiSelect = false;

    // get the last element if any
    this._selectionList = this._selectionList.length
                          ? [this._selectionList[this._selectionList.length - 1]]
                          : [];

    this._selectionListSubject.next(this._selectionList);
  }

  toggleSelection(itemChanged: IGenericSelectionItem): void {
    const exists = this._selectionList.find(i => i.id === itemChanged.id && i.type === itemChanged.type);
    if (exists) {
      pull(this._selectionList, exists);
    } else {
      this._selectionList.push(itemChanged);
    }
    this._selectionListSubject.next(this._selectionList);
  }

  get selection$(): Observable<IGenericSelectionItem[]> {
    return this._selectionListSubject.asObservable();
  }

  public updateItemPosition(item: any) {
    const objIndex = this._selectionList.findIndex(obj => obj.id === item.id && obj.type === item.type);
    if (objIndex >= 0) {
      this._selectionList[objIndex].position = item.position;
    }
    this._selectionList.forEach((item, index, array) => {
      let exist;
      switch (item.type) {
        case 'widget':
        case 'map':
          exist = array.find(a => a.id !== item.id && a.type === item.type && a.payload.size === item.payload.size
          && a.position === item.position);
          break;
        case 'chart':
        case 'sw':
          exist = array.find(a => a.id !== item.id && a.type === item.type
          && a.position === item.position);
          break;
      }
      if (exist || item.position === 0) {
        item.validPosition = false;
      } else {
        item.validPosition = true;
      }
    });
    this._selectionListSubject.next(this._selectionList);
  }

  get allowDisableSelection() {
    return this._allowDisableSelection;
  }

  set allowDisableSelection(item: boolean) {
    this._allowDisableSelection = item;
  }

}

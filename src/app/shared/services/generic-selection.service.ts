import { Injectable } from '@angular/core';
import { pullAllBy, pull } from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

export interface IGenericSelectionItem {
  id: string;
  type: string;
  payload: any;
  position?: any;
}

export class GenericSelectionItem implements IGenericSelectionItem {
  id: string;
  type: string;
  payload: any;
  position?: any;

  constructor(obj: any, type?: string, id?: string) {
    this.id = id || obj['id'] || obj['_id'] || obj['connectorId'] || null;
    this.type = type || typeof obj || null;
    this.payload = obj;
    this.position = obj.position;
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

  toggleSelection(item: IGenericSelectionItem): void {
    const exists = this._selectionList.find(i => i.id === item.id && i.type === item.type);
    if (exists) {
      pull(this._selectionList, exists);
    } else {
      this._selectionList.push(item);
    }
    this._selectionListSubject.next(this._selectionList);
  }

  get selection$(): Observable<IGenericSelectionItem[]> {
    return this._selectionListSubject.asObservable();
  }

  public updateItemPosition(item: any) {
    this._selectionList.map(s => {
      if (s.id === item.id) {
        s.position = item.position;
      }
    });
  }

  get allowDisableSelection() {
    return this._allowDisableSelection;
  }

  set allowDisableSelection(item: boolean) {
    this._allowDisableSelection = item;
  }

}

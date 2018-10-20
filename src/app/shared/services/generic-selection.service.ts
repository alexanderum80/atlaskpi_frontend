import { Injectable } from '@angular/core';
import { pullAllBy } from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

export interface IGenericSelectionItem {
  id: string;
  type: string;
  payload: any;
}

export class GenericSelectionItem implements IGenericSelectionItem {
  id: string;
  type: string;
  payload: any;

  constructor(obj: any, type?: string, id?: string) {
    this.id = id || obj['id'] || obj['_id'] || obj['connectorId'] || null;
    this.type = type || typeof obj || null;
    this.payload = obj;
  }
}

@Injectable()
export class GenericSelectionService {

  private _multiSelect = false;

  private _selectionList: IGenericSelectionItem[] = [];
  private _selectionListSubject = new BehaviorSubject<IGenericSelectionItem[]>([]);

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
      pullAllBy(this._selectionList, [{ 'payload': item.payload }], 'payload');
    } else {
      this._selectionList.push(item);
    }

    this._selectionListSubject.next(this._selectionList);
  }

  get selection$(): Observable<IGenericSelectionItem[]> {
    return this._selectionListSubject.asObservable();
  }

}

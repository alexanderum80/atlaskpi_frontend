import { Injectable } from '@angular/core';
import { pull } from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { IChart } from '../models';

@Injectable()
export class ListChartService {
    private _selectionSubject = new BehaviorSubject < IChart > (null);

    private selectedArray: string[] = [];

    private _inspectorOpenSubject = new BehaviorSubject < boolean > (false);

    get selected$(): Observable < IChart > {
        return this._selectionSubject.asObservable();
    }

    get inspectorOpen$(): Observable < boolean > {
        return this._inspectorOpenSubject.asObservable();
    }

    get selectedCharts() {
        return this.selectedArray;
    }

    setActive(item: IChart) {
        this._selectionSubject.next(item);
    }

    showInspector() {
        this._inspectorOpenSubject.next(true);
    }

    hideInspector() {
        this._inspectorOpenSubject.next(false);
    }

    updateSelected(chart: string) {
        if (this.selectedArray.find(a => a === chart)) {
            pull(this.selectedArray, chart);
        } else {
            this.selectedArray.push(chart);
        }
    }

}
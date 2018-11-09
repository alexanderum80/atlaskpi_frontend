import { Injectable } from '@angular/core';
import { pull } from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class ListChartService {

    private _selectionSubject = new BehaviorSubject < any > (null);

    private selectedArray: string[] = [];

    private _inspectorOpenSubject = new BehaviorSubject < boolean > (false);

    get selected$(): Observable < any > {
        return this._selectionSubject.asObservable();
    }

    get inspectorOpen$(): Observable < boolean > {
        return this._inspectorOpenSubject.asObservable();
    }

    get selectedCharts() {
        return this.selectedArray;
    }

    setActive(item: any) {
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

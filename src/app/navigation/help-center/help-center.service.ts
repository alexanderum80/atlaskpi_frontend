import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { IHelpCenter } from './help-center.component';

@Injectable()
export class HelpCenterService {
    private _videoItems: IHelpCenter[] = [];
    private _videoItemsSubject: BehaviorSubject<IHelpCenter[]> = new BehaviorSubject<IHelpCenter[]>(this._videoItems);


    get videoItems(): IHelpCenter[] {
        return this._videoItems;
    }

    get videoItems$(): Observable<IHelpCenter[]> {
        return this._videoItemsSubject.asObservable().distinctUntilChanged();
    }

    setVideoItems(items: IHelpCenter[]): void {
        if (!items || !items.length) { return; }

        this._videoItems = items;
        this._videoItemsSubject.next(this._videoItems);
    }
}

import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';

import { FormGroupTypeSafe } from '../../shared/services';
import { IListItem } from '../../shared/ui/lists/list-item';
import { ITarget } from '../shared/models/target';

@Component({
    selector: 'app-form-targets',
    templateUrl: './form-targets.component.pug',
    styleUrls: ['./form-targets.component.scss'],
})
export class FormTargetsComponent {
    @Input()
    fg: FormGroupTypeSafe<ITarget>;
    @Input()
    objectiveList: IListItem[];
    @Input()
    baseOnList: IListItem[];
    @Input()
    userList: IListItem[];
    @Input()
    displayForField: boolean;

    @Output()
    save = new EventEmitter();

    @Output()
    cancel = new EventEmitter();

    private _pageCount = 3;
    private _selectedPage = 1;

    setIndex(idx: number) {
        this._selectedPage = idx;
    }

    isSelected(idx: number) {
        return this._selectedPage === idx;
    }

    canGoBack() {
        return this._selectedPage !== 1;
    }

    canGoNext() {
        return this._selectedPage !== this._pageCount;
    }

    goBack() {
        this._selectedPage -= 1;
    }

    goNext() {
        this._selectedPage += 1;
    }
}

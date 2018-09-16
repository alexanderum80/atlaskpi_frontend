import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { FormGroup } from '@angular/forms';
import { FormGroupTypeSafe } from '../../shared/services';
import { ITarget } from '../shared/models/target';
import { IListItem } from '../../shared/ui/lists/list-item';
import { IBasicUser } from '../shared/models/target-user';

// const targesQuery = require('graphql-tag/loader!./list-targets.gql');
// const addTargetsMutation = require('graphql-tag/loader!./add-targets.gql');
// const editTargetsMutation = require('graphql-tag/loader!./update-targets.gql');
// const trargetByName = require('graphql-tag/loader!./target-by-name.gql');

// const updateTarget = require('graphql-tag/loader!./update-target.mutation.gql');
// const createTarget = require('graphql-tag/loader!./create-target.mutation.gql');
// const findTargetByName = require('graphql-tag/loader!./find-target-by-name.gql');
// const removeTarget = require('graphql-tag/loader!./remove-target.gql');

// const addMilestone = require('graphql-tag/loader!./add-milestones.gql');

@Component({
    selector: 'app-form-targets',
    templateUrl: './form-targets.component.pug',
    styleUrls: ['./form-targets.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
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

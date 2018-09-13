import { Component } from '@angular/core';

import { FormTargetsViewModel } from './form-targets.viewmodel';
import { FormGroup } from '@angular/forms';

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
    selector: 'kpi-form-targets',
    templateUrl: './form-targets.component.pug',
    styleUrls: ['./form-targets.component.scss'],
})
export class FormTargetsComponent {

    fg: FormGroup = new FormGroup({});

    activeIndex(index) {
        return false;
    }

    canGoBack() {
        return false;
    }

    canGoNext() {
        return false;
    }
}

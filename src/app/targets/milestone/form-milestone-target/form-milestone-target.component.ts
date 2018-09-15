import { Component, Input } from '@angular/core';
import { FormGroupTypeSafe } from '../../../shared/services';
import { IMilestone } from '../../shared/models/targets.model';
import { TargetScreenService } from '../../shared/services/target-screen.service';

const usersQueryGql = require('graphql-tag/loader!./users.query.gql');

@Component({
  selector: 'kpi-form-milestone-target',
  templateUrl: './form-milestone-target.component.pug',
  styleUrls: ['./form-milestone-target.component.scss'],
})
export class FormMilestoneTargetComponent {
    @Input()
    fg: FormGroupTypeSafe<IMilestone>;

    constructor(private targetService: TargetScreenService) { }

    save() {
        this.fg.markAsPristine();
    }
}

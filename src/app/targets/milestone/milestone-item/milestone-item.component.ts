import { Component, Input } from '@angular/core';

import { FormGroupTypeSafe } from '../../../shared/services';
import { IMilestone } from '../../shared/models/milestone';

@Component({
    selector: 'app-milestone-item',
    templateUrl: './milestone-item.component.pug',
    styleUrls: ['./milestone-item.component.css'],
})
export class MilestoneItemComponent {
    @Input()
    fg: FormGroupTypeSafe<IMilestone>;
}

import { Component, Input } from '@angular/core';
import { FormGroupTypeSafe } from '../../shared/services';
import { ITarget } from '../shared/models/target';

@Component({
  selector: 'app-related-users',
  templateUrl: './related-users.component.pug',
  styleUrls: ['./related-users.component.scss']
})
export class RelatedUsersComponent {
    @Input()
    fg: FormGroupTypeSafe<ITarget>;
}

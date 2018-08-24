import { Component, OnInit, Input, Output, EventEmitter,  ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormMilestoneTargetComponent } from '../form-milestone-target/form-milestone-target.component';
import { ApolloService } from '../../../shared/services/apollo.service';
import { IMilestone } from '../../shared/models/targets.model';

import {
  IDatePickerConfig,
} from '../../../ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';


const addMilestone = require('graphql-tag/loader!./add-milestones.gql');


@Component({
  selector: 'kpi-add-milestones-target',
  templateUrl: './add-milestones-target.component.pug',
  styleUrls: ['./add-milestones-target.component.scss']
})
export class AddMilestonesTargetComponent implements OnInit {
  @Input() fg: FormGroup;
  @Input() vm: any;
  @ViewChild('fromMilestonesTarget') private _form: FormMilestoneTargetComponent;
  @Output() onAdd = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<any>();

  constructor( private _apolloService: ApolloService) { }

  ngOnInit() {
  }


  onSave()  {
    const that = this;
        this._form.vmm.target =  that.vm._id;

        if (this._form.vmm.fg.valid) {
            this._apolloService.mutation < IMilestone > (addMilestone, {'input': this._form.vmm.addPayload})
                .then(res => {
                  that.onAdd.emit();
                })
                .catch(err =>
                  that._displayServerErrors(err)
                );
        }
  }

  cancel() {
    this.onCancel.emit();
  }

  private _displayServerErrors(err) {
    console.log('Server errors: ' + JSON.stringify(err));
}
}

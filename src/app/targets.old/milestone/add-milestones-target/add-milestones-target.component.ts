import { Component, OnInit, Input, Output, EventEmitter,  ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormMilestoneTargetComponent } from '../form-milestone-target/form-milestone-target.component';
import { ApolloService } from '../../../shared/services/apollo.service';
import { IMilestone, ITargetNew } from '../../shared/models/targets.model';

import {
  IDatePickerConfig,
} from '../../../ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';
import { MilestoneService } from '../../../milestones/shared/services/milestone.service';


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
  @Output() newTarget: any = [];

  constructor(private _milestoneService: MilestoneService , private _apolloService: ApolloService) { }

  ngOnInit() {
  }


  onSave()  {
    const that = this;
        this._form.vmm.target =  that.vm._id;
        this._form.vmm.status = 'due';

        if (this._form.vmm.fg.valid && this._form.vmm.target) {
            this._apolloService.mutation < IMilestone > (addMilestone, {'input': this._form.vmm.addPayload})
                .then(data => {
                  const dueDate = that._form.vmm.addPayload.dueDate;
                  const task = that._form.vmm.addPayload.task;
                  const resp = that._form.vmm.addPayload.responsible;
                    that._milestoneService.userMilestoneNotification(resp, { task: task, dueDate: dueDate});
                    that.onAdd.emit();
                })
                .catch(err =>
                  that._displayServerErrors(err)
                );
        } else {
          that.onAdd.emit(this._form.vmm.addPayload);
        }
  }

  cancel() {
    this.onCancel.emit();
  }

  private _displayServerErrors(err) {
    console.log('Server errors: ' + JSON.stringify(err));
}
}

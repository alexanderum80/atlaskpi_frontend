import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormMilestoneTargetComponent } from '../form-milestone-target/form-milestone-target.component';
import { ApolloService } from '../../../shared/services/apollo.service';
import { IMilestone } from '../../shared/models/targets.model';
import { MilestoneService } from '../../../milestones/shared/services/milestone.service';

const editMilestone = require('graphql-tag/loader!./update-milestone.gql'); 

@Component({
  selector: 'kpi-edit-milestones-target',
  templateUrl: './edit-milestones-target.component.pug',
  styleUrls: ['./edit-milestones-target.component.scss']
})
export class EditMilestonesTargetComponent implements OnInit {
  @Input() fg: FormGroup;
  @Input() vm: any;
  @Input() milestones: any = [];
  @Input() item: any = [];
  @ViewChild ('fromMilestonesTarget') _form: FormMilestoneTargetComponent;
  @Output() onEdit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<any>();

  constructor( private _milestoneService: MilestoneService, private _apolloService: ApolloService) { }

  ngOnInit() {
    this._form.milestone = this.milestones.filter(f => '_id' === this.item.id ) ;
  }

  onSave()  {
    const that = this;
        this._form.vmm.target =  that.milestones[0].target;

        if (this._form.vmm.fg.valid && this._form.vmm.target) {
            this._apolloService.mutation < IMilestone > (editMilestone, {
              'id': this.item.id, 'input': this._form.vmm.addPayload})
                .then(data => {
                  const dueDate = that._form.vmm.addPayload.dueDate;
                  const task = that._form.vmm.addPayload.task;
                  const resp = that._form.vmm.addPayload.responsible;
                  that._milestoneService.userMilestoneNotification(resp, { task: task, dueDate: dueDate});
                  that.onEdit.emit();
                })
                .catch(err =>
                  that._displayServerErrors(err)
                );
        }  else {
          that.onEdit.emit(this._form.vmm.addPayload);
        }
  }

  cancel() {
    this.onCancel.emit();
  }

  private _displayServerErrors(err) {
    console.log('Server errors: ' + JSON.stringify(err));
  }


}

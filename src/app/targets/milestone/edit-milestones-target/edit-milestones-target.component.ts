import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormMilestoneTargetComponent } from '../form-milestone-target/form-milestone-target.component';
import { ApolloService } from '../../../shared/services/apollo.service';
import { IMilestone } from '../../shared/models/targets.model';

const editMilestone = require('graphql-tag/loader!./update-milestone.gql'); 

@Component({
  selector: 'kpi-edit-milestones-target',
  templateUrl: './edit-milestones-target.component.pug',
  styleUrls: ['./edit-milestones-target.component.scss']
})
export class EditMilestonesTargetComponent implements OnInit {
  @Input() fg: FormGroup;
  @Input() vm: any;
  @Input() milestones: any;
  @ViewChild ('fromMilestonesTarget') _form: FormMilestoneTargetComponent;
  @Output() onEdit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<any>();

  constructor( private _apolloService: ApolloService) { }

  ngOnInit() {
    this._form.milestone = this.milestones;
  }

  onSave()  {
    const that = this;
             this._form.vmm.target =  that.vm._id;

        if (this._form.vmm.fg.valid) {
            this._apolloService.mutation < IMilestone > (editMilestone, {
              'id': this.milestones[0]._id, 'input': this._form.vmm.addPayload})
                .then(res => {
                  that.onEdit.emit();
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

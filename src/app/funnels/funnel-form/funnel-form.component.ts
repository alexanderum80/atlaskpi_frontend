import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { IFunnel } from '../shared/models/funnel.model';

@Component({
  selector: 'kpi-funnel-form',
  templateUrl: './funnel-form.component.pug',
  styleUrls: ['./funnel-form.component.scss']
})
export class FunnelFormComponent {

    private _funnelModel: IFunnel;

    get funnelModel(): IFunnel {
        return this._funnelModel;
    }

    @Input('funnelModel')
    set funnelModel(value: IFunnel) {
        this._funnelModel = value;
        this._updateFunnelFormGroup(value);
    }

    fg: FormGroup;

    constructor(
        private fb: FormBuilder
    ) {
      this.fg = this._createFunnelFormGroup();
    }

    private _createFunnelFormGroup(): FormGroup {
        return this.fb.group({
            name: new FormControl(''),
            description: new FormControl(''),
            stages: new FormArray([])
        });
    }

    private _updateFunnelFormGroup(value: IFunnel) {
        const { name = '', description = '' } = value || {};

        this.fg.patchValue({
            name,
            description
        });
    }

}

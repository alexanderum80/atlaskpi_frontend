import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { IFunnel, IFunnelStage } from '../shared/models/funnel.model';
import { FormBuilderTypeSafe, FormGroupTypeSafe } from '../../shared/services';
import { SelectionItem, guid } from '../../ng-material-components';

@Component({
  selector: 'kpi-funnel-form',
  templateUrl: './funnel-form.component.pug',
  styleUrls: ['./funnel-form.component.scss']
})
export class FunnelFormComponent {
    private _funnelModel: IFunnel = {
        name: '',
        description: '',
        stages: [ ]
    };

    get funnelModel(): IFunnel {
        return this._funnelModel;
    }

    @Input('funnelModel')
    set funnelModel(value: IFunnel) {
        this._funnelModel = value;
        this._updateFunnelFormGroup(value);
    }

    private _fg: FormGroupTypeSafe<IFunnel>;
    get fg(): FormGroupTypeSafe<IFunnel> {
        return this._fg;
    }

    constructor(
        private fb: FormBuilderTypeSafe,
    ) {
      this._fg = this._createFunnelFormGroup();
    }

    addStage(): void {
        const newStage: IFunnelStage = {
            id: guid()
        };

        this._funnelModel.stages.push(newStage);
    }

    onStageRemoved(stage: IFunnelStage): void {
        this._funnelModel.stages = this.funnelModel.stages.filter(s => s !== stage);
    }

    private _createFunnelFormGroup(): FormGroupTypeSafe<IFunnel> {
        return this.fb.group<IFunnel>({
            _id: [null],
            name: [null, Validators.required],
            description: [null, Validators.required],
            stages: this.fb.array([])
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

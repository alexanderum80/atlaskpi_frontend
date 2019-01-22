import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { IFunnel, IFunnelStage } from '../shared/models/funnel.model';
import { FormBuilderTypeSafe, FormGroupTypeSafe } from '../../shared/services';

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

    private _fg: FormGroupTypeSafe<IFunnel>;
    get fg(): FormGroupTypeSafe<IFunnel> {
        return this._fg;
    }

    constructor(
        private fb: FormBuilderTypeSafe
    ) {
      this._fg = this._createFunnelFormGroup();
    }

    addStage(): void {
        const newStage: IFunnelStage = {
            order: this.funnelModel.stages.length + 1,
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

    // private getStageForm(s: IFunnelStage) {
    //     if (!s) { s = { } as any; }

    //     return this.fb.group<IFunnelStage>({
    //         order: [this.funnelModel.stages.length + 1 ],
    //         name: [null, Validators.required],
    //         description: [null, Validators.required],
    //         kpi: [null, Validators.required],
    //         selectedFields: [null],
    //         compareToStage: [null],
    //         foreground: [null, Validators.required],
    //         background: [null, Validators.required]
    //     });
    // }

}

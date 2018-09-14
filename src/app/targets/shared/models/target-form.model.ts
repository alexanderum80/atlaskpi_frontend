import { ITarget, ITargetSource, ITargetUser } from './target';
import { Validators, FormArray } from '@angular/forms';
import { FormGroupTypeSafe, FormBuilderTypeSafe } from '../../../shared/services';
import { ITargetNotificationConfig } from './targets.model';

export class TargetFormModel {

    private _form: FormGroupTypeSafe<ITarget>;
    get form(): FormGroupTypeSafe<ITarget> {
        return this._form;
    }

    constructor(private builder: FormBuilderTypeSafe) {
        this.buildForm();
    }

    update(t: ITarget) {
        if (!t) {
            return this._form.reset();
        }

        this._form.patchValueSafe({
            active: t.active,
            appliesTo: t.appliesTo,
            compareTo: t.compareTo,
            id: t.id,
            name: t.name,
            period: t.period,
            recurrent: t.recurrent,
            source: t.source,
            type: t.type,
            unit: t.unit,
            value: t.value,
        });

        if (t.notificationConfig.users) {
            const users = this._form.getSafe(f => f.notificationConfig.users) as FormArray;
            users.controls.splice(0, users.controls.length);

            t.notificationConfig.users.forEach(u => {
                users.controls.push(this.getTargetUserForm(u));
            });
        }
    }

    private buildForm() {
        this._form = this.builder.group<ITarget>({
            id: [null],
            active: [null, Validators.required],
            appliesTo: [null, Validators.required],
            period: [null, Validators.required],
            compareTo: [null, Validators.required],
            name: [null, Validators.required],
            notificationConfig: this.builder.group<ITargetNotificationConfig>({
                users: this.builder.array([])
            }),
            recurrent: [null, Validators.required],
            source: this.builder.group<ITargetSource>({
                identifier: [null, Validators.required],
                type: [null, Validators.required],
            }),
            type: [null, Validators.required],
            unit: [null, Validators.required],
            value: [null, Validators.required],
        });
    }

    private getTargetUserForm(u: ITargetUser) {
        return this.builder.group<ITargetUser>({
            deliveryMethods: [u.deliveryMethods, Validators.required],
            identifier: [u.identifier, Validators.required]
        });
    }

}

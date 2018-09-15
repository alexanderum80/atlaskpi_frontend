import { ITarget, ITargetSource, ITargetUser } from './target';
import { Validators, FormArray } from '@angular/forms';
import { FormGroupTypeSafe, FormBuilderTypeSafe } from '../../../shared/services';
import { ITargetNotificationConfig, IMilestone } from './targets.model';


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

        if (t.milestones) {
            const milestones = this._form.getSafe(f => f.milestones) as FormArray;
            milestones.controls.splice(0, milestones.controls.length);

            t.milestones.forEach(m => {
                milestones.controls.push(this.getMilestoneForm(m));
            });
        }
    }

    addUser() {
        const users = this._form.getSafe(f => f.notificationConfig.users) as FormArray;
        users.controls.push(this.getTargetUserForm(null));
    }

    removeUser(index: number) {
        const users = this._form.getSafe(f => f.notificationConfig.users) as FormArray;
        users.removeAt(index);
    }

    addMilestone() {
        const milestones = this._form.getSafe(f => f.milestones) as FormArray;
        milestones.controls.push(this.getMilestoneForm(null));
    }

    removeMilestone(index: number) {
        const milestones = this._form.getSafe(f => f.milestones) as FormArray;
        milestones.removeAt(index);
    }

    private buildForm() {
        this._form = this.builder.group<ITarget>({
            id: [null],
            active: [null, Validators.required],
            appliesTo: [null, Validators.required],
            compareTo: [null, Validators.required],
            name: [null, Validators.required],
            notificationConfig: this.builder.group<ITargetNotificationConfig>({
                users: this.builder.array([])
            }),
            source: this.builder.group<ITargetSource>({
                identifier: [null, Validators.required],
                type: [null, Validators.required],
            }),
            type: [null, Validators.required],
            unit: [null, Validators.required],
            value: [null, Validators.required],
            milestones: this.builder.array([]),
        });
    }

    private getTargetUserForm(u: ITargetUser) {
        if (!u) { u = {} as any; }

        return this.builder.group<ITargetUser>({
            deliveryMethods: [u.deliveryMethods, Validators.required],
            identifier: [u.identifier, Validators.required]
        });
    }

    private getMilestoneForm(ms: IMilestone) {
        if (!ms) { ms = {} as any; }

        return this.builder.group<IMilestone>({
            _id: [ms._id],
            dueDate: [ms.dueDate],
            responsible: [ms.responsible],
            status: [ms.status],
            task: [ms.task, Validators.required],
            target: [ms.target]
        });
    }

}

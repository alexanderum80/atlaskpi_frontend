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
            active: t.active !== undefined ? t.active : true,
            appliesTo: t.appliesTo,
            compareTo: t.compareTo,
            _id: t._id,
            name: t.name,
            source: t.source,
            type: t.type,
            unit: t.unit,
            value: t.value,
            notificationConfig: t.notificationConfig,
            milestones: t.milestones,
        });

        if (t.notificationConfig.users && t.notificationConfig.users.length) {
            const users = this._form.getSafe(f => f.notificationConfig.users) as FormArray;

            for (let i = 0; i < users.length; i++) {
                users.removeAt(0);
            }

            t.notificationConfig.users.forEach(u => {
                users.push(this.getTargetUserForm(u));
            });
        }

        if (t.milestones && t.milestones.length) {
            const milestones = this._form.getSafe(f => f.milestones) as FormArray;

            for (let i = 0; i < milestones.length; i++) {
                milestones.removeAt(0);
            }

            t.milestones.forEach(m => {
                milestones.push(this.getMilestoneForm(m));
            });
        }
    }

    addUser() {
        const users = this._form.getSafe(f => f.notificationConfig.users) as FormArray;
        users.push(this.getTargetUserForm(null));
    }

    removeUser(index: number) {
        const users = this._form.getSafe(f => f.notificationConfig.users) as FormArray;
        users.removeAt(index);
    }

    addMilestone() {
        const milestones = this._form.getSafe(f => f.milestones) as FormArray;
        milestones.push(this.getMilestoneForm(null));
    }

    removeMilestone(index: number) {
        const milestones = this._form.getSafe(f => f.milestones) as FormArray;
        milestones.removeAt(index);
    }

    private buildForm() {
        this._form = this.builder.group<ITarget>({
            _id: [null],
            active: [null, Validators.required],
            appliesTo: [null],
            compareTo: [null],
            name: [null, Validators.required],
            notificationConfig: this.builder.group<ITargetNotificationConfig>({
                users: this.builder.array([])
            }),
            source: this.builder.group<ITargetSource>({
                identifier: [null],
                type: [null],
            }),
            type: [null, Validators.required],
            unit: [null, Validators.required],
            value: [null, Validators.required],
            milestones: this.builder.array([]),
        });
    }

    private getTargetUserForm(u: ITargetUser) {
        if (!u) { u = { deliveryMethods: [] } as any; }

        return this.builder.group<ITargetUser>({
            deliveryMethods: [u.deliveryMethods],
            identifier: [u.identifier, Validators.required],
            email: [u.deliveryMethods.filter(m => m === 'email').length],
            push: [u.deliveryMethods.filter(m => m === 'push').length],
        });
    }

    private getMilestoneForm(ms: IMilestone) {
        if (!ms) { ms = {} as any; }

        return this.builder.group<IMilestone>({
            dueDate: [!ms.dueDate ? null : new Date(ms.dueDate).toLocaleDateString('en-US')],
            responsible: [ms.responsible, Validators.required],
            status: [ms.status || 'due', Validators.required],
            task: [ms.task, Validators.required],
        });
    }

}

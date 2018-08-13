import { Injectable } from '@angular/core';
import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { Field } from '../../ng-material-components/viewModels';
import { ITarget, IRelatedUser, IMilestone } from '../shared/models/targets.model';
import { SelectionItem } from '../../ng-material-components';
import { MilestonesViewModel } from '../../milestones/milestones.viewmodel';


export class RelatedUseViewModel extends ViewModel<IRelatedUser> {

    @Field({ type: String })
    user: string;

    @Field({ type: String })
    email: boolean;

    @Field({ type: String })
    phone: boolean;

    initialize(model: IRelatedUser): void {
        this.onInit(model);
    }
}

export class  MilestoneViewModel extends ViewModel<IMilestone> {
    @Field({ type: String })
    description: string;

    @Field({ type: String })
    completetionDate: boolean;

    @Field({ type: String })
    responsiblePeople: boolean;

    @Field({ type: String })
    stauts: boolean;

    initialize(model: IMilestone): void {
        this.onInit(model);
    }
}

@Injectable()
export class FormTargetsViewModel extends ViewModel<ITarget> {

    constructor() {
        super(null);
    }

    titleAction = "Add an execution plan for this target";

    actived = false;

    objetiveList: SelectionItem[] =[
        { id: 'increase', title: 'Increase' },
        { id: 'decrease', title: 'Decrease' },
        { id: 'fixed', title: 'fixed' },
    ];
    periodList: SelectionItem[] = [
        { id: 'pt', title: 'Part Time' },
        { id: 'ft', title: 'Full Time' },
        { id: 'terminate', title: 'Terminated' },
        { id: 'suspend', title: 'suspended' }
    ];
    baseOnList: SelectionItem[] = [
        { id: 'pt', title: 'Part Time' },
        { id: 'ft', title: 'Full Time' },
        { id: 'terminate', title: 'Terminated' },
        { id: 'suspend', title: 'suspended' }
    ];

    userList: SelectionItem[] = [{
        id: 'current', title: 'Curruent User'
    },{
        id: 'other', title: 'Other User'
    }]

    responsiblePeopleList: SelectionItem[]=[{
        id: 'People', title: 'People'
    }]

    statusList: SelectionItem[]=[{
        id: 'due', title: 'Due'
    }]


    @Field({ type: String, required: true })
    name: string;

    @Field({ type: String })
    objetive: string;

    @Field({ type: String, required: true })
    value: string;

    @Field({ type: String , required: true})
    period: string;

    @Field({ type: String, required: true })
    baseOn: string;

    @Field({ type: String })
    repeat: string;

    @Field({ type: Boolean })
    active: boolean;

    @Field({ type: String })
    nextDueDate: string;
    
    @Field({ type: RelatedUseViewModel })
    relatedUse: IRelatedUser;

    @Field({ type: MilestonesViewModel })
    milestone: IMilestone;


    initialize(model: any): void {
        this.onInit(model);
    }

    get addPayload() {
        const value = this.modelValue;

        return {
            name: value.name,
            objetive: value.objetive,
            value: value.value,
            period: this.period,
            baseOn: this.baseOn,
            repeat: this.repeat,
            active: this.active,
            nextDueDate: this.nextDueDate,
            relatedUse: this.relatedUse,
            milestone: this.milestone
        };
    }

    get editPayload() {
        const value = this.addPayload as any;
        value.id = this._id;

        return value;
    }

}


// Angular Imports
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormArray } from '@angular/forms/src/model';
import * as moment_timezone from 'moment-timezone';

import { SelectionItem } from '../../ng-material-components';
import { ArrayField, Field } from '../../ng-material-components/viewModels';
import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { ITag, ITagItem } from '../../shared/domain/shared/tag';
import { TagsViewModel } from '../../shared/view-models/tags.viewmodel';
import { ILocation, IOperationHours } from '../shared/models/location.model';

// App Code
// App Code
export class OperationHoursViewModel extends ViewModel < IOperationHours > {

    @Field({ type: String })
    day: string;

    @Field({ type: String })
    from: string;

    @Field({ type: String })
    to: string;

    @Field({ type: String })
    fromAMPM: string;

    @Field({ type: String })
    toAMPM: string;

    initialize(model: IOperationHours): void {
        this.onInit(model);
    }
}

@Injectable()
export class LocationFormViewModel extends ViewModel < ILocation > {

    private _tags: ITagItem[];

    constructor() {
        super(null);
    }

    businessUnits: SelectionItem[];
    countries: SelectionItem[];
    states: SelectionItem[];

    localTimeZone: string;
    timeZonesList: SelectionItem[] = [];

    ampm: SelectionItem[] = [{
            id: 'am',
            title: 'am'
        },
        {
            id: 'pm',
            title: 'pm'
        }
    ];

    days: SelectionItem[] = [{
            id: 'SUN',
            title: 'Sunday'
        },
        {
            id: 'MON',
            title: 'Monday'
        },
        {
            id: 'TUE',
            title: 'Tuesday'
        },
        {
            id: 'WED',
            title: 'Wednesday'
        },
        {
            id: 'THU',
            title: 'Thursday'
        },
        {
            id: 'FRI',
            title: 'Friday'
        },
        {
            id: 'SAT',
            title: 'Saturday'
        }
    ];

    @Field({ type: String, required: true })
    name: string;

    @Field({ type: String })
    description: string;

    @Field({ type: String, required: true })
    businessunits: string;

    @Field({ type: String, required: true })
    street: string;

    @Field({ type: String, required: true })
    city: string;

    @Field({ type: String, required: true })
    state: string;

    @Field({ type: String, required: true })
    country: string;

    @Field({ type: String, required: true })
    zip: string;

    @Field({ type: String, required: true })
    timezone: string;

    @ArrayField({ type: OperationHoursViewModel })
    operhours: OperationHoursViewModel[];

    @ArrayField({ type: TagsViewModel })
    tags: TagsViewModel[];

    get operHours(): FormArray {
        return this.fg.get('operhours') as FormArray;
    }

    initialize(model: any): void {
        if (model) {
            const cleanModel = this._processModel(model);
            this.onInit(cleanModel);
        } else {
            this.onInit(model);
        }
    }

    update(model) {
        const cleanModel = this._processModel(model);
        Object.assign(this, cleanModel);
    }

    get operationHours(): FormArray {
        const hours = this.fg.get('operhours');

        return hours ? hours as FormArray : null;
    }

    get addPayload(): ILocation {
        const value = this.fg.value;
        const payload: ILocation = {
            _id: value.id,
            name: value.name,
            description: value.description,
            businessunits: value.businessunits,
            street: value.street,
            city: value.city,
            state: value.state,
            country: value.country,
            zip: value.zip,
            timezone: value.timezone,
            operhours: value.operhours,
            tags: value.tags ? value.tags.map(t => t.value) : null
        };

        const result = {
            input: payload
        } as any;

        if (this._id) {
            result.id = this._id;
        }

        return result;
    }

    get existingTags(): ITagItem[] {
        return this._tags;
    }

    dataByDayValid(day: number) {
        const dataByDay = (this.fg.get('operhours') as FormArray).at(day).value;
        if (dataByDay.from === '' || dataByDay.to === '' || dataByDay.from === null || dataByDay.to === null) {
            return day;
        }
    }

    updateTags(tags: ITag[]) {
        this._tags = tags.map(t => ({
            value: t.name,
            display: t.name
        }));
    }

    addOperHours() {
        this.fg.controls['country'].setValue('US');
        const newOperHours = this.days;
        for (const i in newOperHours) {
            if (newOperHours[i]) {
                const idOperHours = newOperHours.find(a => a.id === newOperHours[i].id);
                this.operhours.push(new FormGroup({
                    day: new FormControl(idOperHours.id),
                    from: new FormControl(''),
                    fromAMPM: new FormControl('am'),
                    to: new FormControl(''),
                    toAMPM: new FormControl('pm')
                }) as any);
            }
        }
    }

    copyDataByDay(dayB: number, dayA: number) {
        const dataByDay = (this.fg.get('operhours') as FormArray).at(dayB).value;
        if (dataByDay.from === '' || dataByDay.to === '' || dataByDay.from === null || dataByDay.to === null) {
            return;
        } else {
            (this.fg.get('operhours') as FormArray).at(dayA).get('from').setValue(dataByDay.from);
            (this.fg.get('operhours') as FormArray).at(dayA).get('to').setValue(dataByDay.to);
            (this.fg.get('operhours') as FormArray).at(dayA).get('fromAMPM').setValue(dataByDay.fromAMPM);
            (this.fg.get('operhours') as FormArray).at(dayA).get('toAMPM').setValue(dataByDay.toAMPM);
        }
    }

    deleteDataByDay(dataDay) {
        (this.fg.get('operhours') as FormArray).at(dataDay).get('from').reset();
        (this.fg.get('operhours') as FormArray).at(dataDay).get('to').reset();
        (this.fg.get('operhours') as FormArray).at(dataDay).get('fromAMPM').setValue('am');
        (this.fg.get('operhours') as FormArray).at(dataDay).get('toAMPM').setValue('pm');
    }

    loadTimeZone() {

        this.localTimeZone = moment_timezone.tz.guess();
        this.timeZonesList = this._generateTimeZoneOptions();
    }

    private _generateTimeZoneOptions(): SelectionItem[] {
        const timeZones = moment_timezone.tz.names();
        // const offsetTmz = [];
        const list = [];
        for (const i in timeZones) {
            if (timeZones[i]) {
                const title = '(GMT' + moment_timezone.tz(timeZones[i]).format('Z') + ')' + timeZones[i];
                list.push(new SelectionItem(timeZones[i], title));
            }
        }

        return list;
    }

    private _processModel(model: ILocation) {
        if (!model) {
            return null;
        }
        // deserialize expression and filters
        const cleanModel = this.objectWithoutProperties(model, ['__typename']) as ILocation;

        if (cleanModel.tags) {
            cleanModel.tags = cleanModel.tags.map(t => ({
                value: t,
                display: t
            })) as any;
        }
        return cleanModel;
    }
}


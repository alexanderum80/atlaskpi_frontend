// Angular Import
import { CommonService } from '../../shared/services/common.service';
import { FormArray, FormGroup } from '@angular/forms';
import {Component, Input, OnInit, OnDestroy} from '@angular/core';

// App Code
import {
    IEmployee
} from '../shared/models/employee.model';
import {
    EmployeeFormViewModel
} from './employee-form.viewmodel';
import { SelectPickerService } from '../../shared/services/select-picker.service';
import {
    Subscription
} from 'rxjs/Subscription';
import {
    IDatePickerConfig,
  } from '../../ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';

@Component({
    selector: 'kpi-employee-form',
    templateUrl: './employee-form.component.pug',
    providers: [EmployeeFormViewModel]
})
export class EmployeeFormComponent implements OnInit, OnDestroy {
    @Input() model: IEmployee;
    datePickerConfig: IDatePickerConfig;

    private _subscription: Subscription[] = [];

    constructor(
        public vm: EmployeeFormViewModel,
        private _selectPickerService: SelectPickerService) {}

    ngOnInit(): void {
        this.vm.initialize(this.model);
        const that = this;

        // select picker lists
        const svc = this._selectPickerService;
        const vm = this.vm;

        svc.getLocations().then(locations => vm.locations = locations);
        svc.getBusinessUnits().then(businessUnits => vm.businessUnits = businessUnits);
        svc.getDepartments().then(departments => vm.departments = departments);
        svc.getCountries().then(countries => that.vm.countries = countries);
        this._subscription.push(vm.fg.get('address.country').valueChanges.subscribe(country => {
            svc.getStatesFor(country).then(states => that.vm.states = states);
        }));

        this.datePickerConfig = {
            showGoToCurrent: false,
            format: 'MM/DD/YYYY'
        };
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    addEmployment() {
        this.vm.employmentInfo.push(new FormGroup({}) as any);
    }

    update(model: IEmployee): void {
        this.vm.update(model);
    }

    removeEmploymentInfo(item: FormGroup): void {
        const employeeInfoControls = this.vm.fg.get('employmentInfo') as FormArray;
        const filterIndex = employeeInfoControls.controls.findIndex(c => c === item);

        if (filterIndex > -1) {
            (this.vm.fg.get('employmentInfo') as FormArray).removeAt(filterIndex);
        }
    }

    updateStateList(country: string): void {
        const that = this;

        this._selectPickerService
            .getStatesFor(country)
            .then(states => {
                that.vm.states = states;
            });
    }
}

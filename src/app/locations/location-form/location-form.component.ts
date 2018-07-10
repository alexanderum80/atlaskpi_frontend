// Angular Import
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ITag } from '../../shared/domain/shared/tag';
import { ApolloService } from '../../shared/services/apollo.service';
import { CommonService } from '../../shared/services/common.service';
import { SelectPickerService } from '../../shared/services/select-picker.service';
import { ILocation } from '../shared/models/location.model';
import { LocationFormViewModel } from './location-form.viewmodel';

// App Code
const tags = require('graphql-tag/loader!./tags.gql');

@Component({
    selector: 'kpi-location-form',
    templateUrl: './location-form.component.pug',
    styleUrls: ['./location-form.component.scss'],
    providers: [LocationFormViewModel]
})
export class LocationFormComponent implements OnInit, OnDestroy {
    @Input() model: ILocation;
    @Input() adding :boolean;

  private _subscription: Subscription[] = [];
    
    constructor(
        public vm: LocationFormViewModel,
        private _selectPickerService: SelectPickerService,
        private _apolloService: ApolloService) { }

    ngOnInit(): void {
        this.vm.initialize(this.model);
        this._getTags();

        const that = this;

        // select picker lists
        const svc = this._selectPickerService;
        const vm = this.vm;
        
        svc.getBusinessUnits().then(businessUnits => vm.businessUnits = businessUnits);
        svc.getCountries().then(countries => vm.countries = countries);

         this._subscription.push(vm.fg.get('country').valueChanges.subscribe(country => {
            svc.getStatesFor(country).then(states => that.vm.states = states);

        }));

        this.vm.loadTimeZone();

        if (this.adding) { 
            this.vm.addOperHours(); }
    }

    update(model: ILocation): void { this.vm.update(model); }

    addData(itemIndex: number) { this.vm.copyDataByDay(itemIndex, itemIndex + 1); }

    delData(itemIndex: number) { this.vm.deleteDataByDay(itemIndex) }

    isLastDay(index: number) { return index <= 5; }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

    private _getTags() {
        const that = this;
        this._apolloService.networkQuery<{ tags: ITag[] }>(tags)
            .then(res => {
                that.vm.updateTags(res.tags);
            });
    }
}

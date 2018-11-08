import { Apollo } from 'apollo-angular';
import { ShowMapFormComponent } from '../show-map-form/show-map-form.component';
import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    IMapMarker
} from '../shared/models/map-marker';
import {
    OnChanges
} from '@angular/core/src/metadata/lifecycle_hooks';
import { sortBy } from 'lodash';
import { Subscription } from 'rxjs/Subscription';
import {objectWithoutProperties} from '../../shared/helpers/object.helpers';
import {CommonService} from '../../shared/services/common.service';
import { Store } from 'src/app/shared/services';
import { style_dark } from './dark-map-styles';

const mapMarkerQuery = require('graphql-tag/loader!./map-markers.query.gql');

export interface ILegendColorConfig {
    color: string;
    min: number;
    max: number;
}

export interface IMapMarkerResponse {
    mapMarkers: any;
}

@Component({
    selector: 'kpi-show-map',
    templateUrl: './show-map.component.pug',
    styleUrls: ['./show-map.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ShowMapComponent implements OnChanges, OnDestroy, OnInit {
    @Input() markers: IMapMarker[];
    @Input() legendColors: ILegendColorConfig[];
    @Input() legendClosed = false;
    @Input() Height = '400px';
    //hiding this until fully functional
    @Input() showSettingsBtn = false;
    @Input() showLegendBtn = true;
    @ViewChild('showMapForm') private _form: ShowMapFormComponent;

    lat: number;
    lng: number;
    style = [];

    showingLegend = true;

    showingMapSettings = false;
    isMapMarkerGrouping = false;

    private _subscription: Subscription[] = [];

    constructor(private _apollo: Apollo,
                private _store: Store) {
                    this._store.changes$.subscribe(
                        (state) => this.checkAppTheme(state)
                    )
                }

    ngOnInit() {
        this.showingLegend = !this.legendClosed;
    }
    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    ngOnChanges() {
        // calculate middle point
        if (!this.markers || !this.markers.length) {
            return;
        }

        this._setLatAndLngMarkers(this.markers);
    }

    showLegend() {
        this.showingLegend = true;
    }

    closeLegend() {
        this.showingLegend = false;
    }

    clickedMarker(marker: IMapMarker) {
        // do nothing now
        console.log('Marker clicked');
    }

    showMapSettings(): void {
        this.showingMapSettings = true;
    }

    closeMapSettings(): void {
        this.showingMapSettings = false;
    }

    showMapGroupings(): void {
        if (!Object.keys(this._form.vm.payload).length) { return; }
        const that = this;
        this.isMapMarkerGrouping = this._form.vm.payload.grouping ? true : false;
        this._subscription.push(this._apollo.watchQuery<IMapMarkerResponse>({
            query: mapMarkerQuery,
            fetchPolicy: 'network-only',
            variables: {
                input: this._form.vm.payload
            }
        })
        .valueChanges
        .subscribe(({ data }) => {
            that.closeMapSettings();
            if (!data || !data.mapMarkers || !data.mapMarkers.length) { return; }

            that.markers = data.mapMarkers.map(m => objectWithoutProperties(m, ['__typename']));
            that._setLatAndLngMarkers(that.markers);
        }));
    }

    get isFormValid(): boolean {
        const isValid = (
            this._form &&
            this._form.vm.dateRange
        ) ? true : false;

        return isValid;
    }

    private _setLatAndLngMarkers(markers: IMapMarker[]): void {
        // center the map on the biggest value
        const markersSorted = sortBy(markers, (m) => m.value * -1);
        this.lat = markersSorted[0].lat;
        this.lng = markersSorted[0].lng;

        // set icon
        markers.forEach(m => {
            if (m.color) {
                m.iconUrl = `assets/img/maps/${m.color}-pin.png`;
            }
        });
    }

    checkAppTheme(state){
        // Check theme in app state
        console.log(state);
    if(state.theme == 'dark'){
            this.style = style_dark;
        }else{
            this.style = []; 
        }
    }
}

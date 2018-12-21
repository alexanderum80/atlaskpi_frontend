import { FormGroup } from '@angular/forms';
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
    @Input() markers: any[];
    @Input() legendColors: ILegendColorConfig[];
    @Input() legendClosed = false;
    @Input() Height = '100%';
    @Input() showSettingsBtn = false;
    @Input() showLegendBtn = true;
    @Input() kpi: string;
    @Input() grouping: string[];
    @Input() zipCodeSource: string;
    @Input() mapsTitle: string;
    @Input() mapSize: string;
    @ViewChild('showMapForm') private _form: ShowMapFormComponent;

    lat: number;
    lng: number;
    style = [];

    showingLegend = true;

    showingMapSettings = false;
    isMapMarkerGrouping = false;
    subscription: Subscription;
    fullscreen = false;

    private _subscription: Subscription[] = [];

    constructor(private _apollo: Apollo,
                private _store: Store) {
                this.subscription= this._store.changes$.subscribe(
                        (state) => this.checkAppTheme(state)
                    );
                }

    ngOnInit() {
        this.showingLegend = !this.legendClosed;
        this.showingLegend = this.mapSize === 'big' ? true : false;
    }
    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
        this.subscription.unsubscribe();
    }

    ngOnChanges() {
        if (this.grouping) {
            this.isMapMarkerGrouping = this.grouping.length > 1;
        }
        // calculate middle point
        if (!this.markers || !this.markers.length) {
            return;
        }

        this._setLatAndLngMarkers(this.markers);
    }

    showLegend() {
        this.showingMapSettings = false;
        this.showingLegend = this.showingLegend ? false : true;
    }
    showFullscreen() {
        this.fullscreen = this.fullscreen ? false : true;
    }

    closeLegend() {
        this.showingLegend = false;
    }

    clickedMarker(marker: IMapMarker) {
        // do nothing now
        console.log('Marker clicked');
    }

    showMapSettings(): void {
        this.showingLegend = false;
        this.showingMapSettings = this.showingMapSettings ? false : true;
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
                input: {
                    kpi: this.kpi,
                    grouping: this._form.vm.payload.grouping 
                        ? [this.zipCodeSource, this._form.vm.payload.grouping] 
                        : this.grouping, 
                    dateRange: JSON.stringify({predefined: this._form.vm.payload.dateRange, custom: {from: null, to: null}})
                }
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

    get actualKpi() {
        return this.kpi;
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

    checkAppTheme(state) {
        // Check theme in app state
    if (state.theme === 'dark') {
            this.style = style_dark;
        } else {
            this.style = [];
        }
    }
}

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
export class ShowMapComponent implements OnChanges, OnDestroy {
    @Input() markers: IMapMarker[];
    @Input() legendColors: ILegendColorConfig[];

    @ViewChild('showMapForm') private _form: ShowMapFormComponent;

    lat: number;
    lng: number;
    style = [];
    style_dark = [
        {
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#1d2c4d"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#8ec3b9"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#1a3646"
            }
          ]
        },
        {
          "featureType": "administrative.country",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#4b6878"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#64779e"
            }
          ]
        },
        {
          "featureType": "administrative.province",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#4b6878"
            }
          ]
        },
        {
          "featureType": "landscape.man_made",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#334e87"
            }
          ]
        },
        {
          "featureType": "landscape.natural",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#023e58"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#283d6a"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#6f9ba5"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#1d2c4d"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#023e58"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#3C7680"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#304a7d"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#98a5be"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#1d2c4d"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#2c6675"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#255763"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#b0d5ce"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#023e58"
            }
          ]
        },
        {
          "featureType": "transit",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#98a5be"
            }
          ]
        },
        {
          "featureType": "transit",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#1d2c4d"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#283d6a"
            }
          ]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#3a4762"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#0e1626"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#4e6d70"
            }
          ]
        }
      ];
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
        debugger;
        console.log(state);
    if(state.theme == 'dark'){
            this.style = this.style_dark;
        }else{
            this.style = []; 
        }
    }
}

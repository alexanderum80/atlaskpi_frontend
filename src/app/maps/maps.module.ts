import { MaterialFormsModule } from '../ng-material-components/modules/forms';
import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { environment } from '../../environments/environment';
import { MaterialUserInterfaceModule } from '../ng-material-components';
import { LegendService } from './shared/legend.service';
import { ShowMapComponent } from './show-map/show-map.component';
import { ShowMapFormComponent } from './show-map-form/show-map-form.component';
import { MapViewMiniComponent } from './map-view-mini/map-view-mini.component';
import { MapViewBigComponent } from './map-view-big/map-view-big.component';

@NgModule({
    imports: [
        CommonModule,
        AgmCoreModule.forRoot({
            apiKey: environment.googleMapApi
        }),
        MaterialUserInterfaceModule,
        MaterialFormsModule
    ],
    declarations: [
        ShowMapComponent,
        ShowMapFormComponent,
        MapViewMiniComponent,
        MapViewBigComponent
    ],
    exports: [
        ShowMapComponent,
        MapViewMiniComponent,
        MapViewBigComponent
    ],
    providers: [
        LegendService
    ]
})
export class MapsModule {}

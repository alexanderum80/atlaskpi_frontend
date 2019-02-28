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
import { AutoRenderableMapComponent } from './auto-renderable-map/auto-renderable-map.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        AgmCoreModule.forRoot({
            apiKey: environment.googleMapApi
        }),
        MaterialUserInterfaceModule,
        MaterialFormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        ShowMapComponent,
        ShowMapFormComponent,
        MapViewMiniComponent,
        MapViewBigComponent,
        AutoRenderableMapComponent
    ],
    exports: [
        ShowMapComponent,
        MapViewMiniComponent,
        MapViewBigComponent,
        AutoRenderableMapComponent
    ],
    providers: [
        LegendService
    ]
})
export class MapsModule {}

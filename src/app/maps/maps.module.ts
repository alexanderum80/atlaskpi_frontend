import { MaterialFormsModule } from '../ng-material-components/modules/forms/index';
import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { environment } from '../../environments/environment';
import { MaterialUserInterfaceModule } from '../ng-material-components/index';
import { LegendService } from './shared/legend.service';
import { ShowMapComponent } from './show-map/show-map.component';
import { ShowMapFormComponent } from './show-map-form/show-map-form.component';

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
        ShowMapFormComponent
    ],
    exports: [
        ShowMapComponent
    ],
    providers: [
        LegendService
    ]
})
export class MapsModule {}

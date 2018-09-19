//  Angular Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// App Code
import { LocationsRoutingModule } from './locations-routing.module';

import { ListLocationsComponent } from './list-locations/list-locations.component';
import { AddLocationComponent } from './add-location/add-location.component';
import { EditLocationComponent } from './edit-location/edit-location.component';
import { LocationFormComponent } from './location-form/location-form.component';
import { SharedModule } from '../shared';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    NgxDatatableModule,
    LocationsRoutingModule,
    SharedModule,
    TagInputModule ,
    BrowserAnimationsModule
  ],
  declarations: [
     ListLocationsComponent,
     AddLocationComponent,
     EditLocationComponent,
     LocationFormComponent,
  ]
})
export class LocationsModule { }

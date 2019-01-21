import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FunnelRoutingModule } from './funnel-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared';
import { FunnelComponent } from './funnel.component';
import { ListFunnelComponent } from './list-funnel/list-funnel.component';
import { NoFunnelComponent } from './no-funnel/no-funnel.component';
import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    FunnelRoutingModule
  ],
  declarations: [FunnelComponent, ListFunnelComponent, NoFunnelComponent],
  exports: [FunnelComponent],
  providers: []
})
export class FunnelModule { }

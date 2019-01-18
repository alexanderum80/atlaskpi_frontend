import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FunnelRoutingModule } from './funnel-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared';
import { FunnelComponent } from './funnel.component';
import { ListFunnelComponent } from './list-funnel/list-funnel.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    FunnelRoutingModule
  ],
  declarations: [FunnelComponent, ListFunnelComponent],
  exports: [FunnelComponent],
  providers: []
})
export class FunnelModule { }
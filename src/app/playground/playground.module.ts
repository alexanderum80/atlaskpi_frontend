import { ReactiveFormsModule } from '@angular/forms';
import { WidgetsModule } from '../widgets';
import { MaterialUserInterfaceModule, MaterialFormsModule } from '../ng-material-components';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaygroundComponent } from './playground.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialFormsModule,
    MaterialUserInterfaceModule,
    WidgetsModule
  ],
  declarations: [PlaygroundComponent]
})
export class PlaygroundModule { }

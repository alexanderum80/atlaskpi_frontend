import { SettingsComponent } from './settings.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SettingsComponent],
  exports: [SettingsComponent]
})
export class SettingsModule { }

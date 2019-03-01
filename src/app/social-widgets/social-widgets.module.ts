import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialWidgetComponent } from './social-widget/social-widget.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [SocialWidgetComponent],
  exports: [ SocialWidgetComponent ]
})
export class SocialWidgetsModule { }

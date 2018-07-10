import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialWidgetComponent } from './social-widget/social-widget.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SocialWidgetComponent],
  exports: [ SocialWidgetComponent ]
})
export class SocialWidgetsModule { }

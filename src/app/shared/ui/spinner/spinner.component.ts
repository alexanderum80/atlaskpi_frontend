import { Component, OnInit } from '@angular/core';
import { BrowserService, IViewportSize } from '../../services/browser.service';
import { Store } from '../../services';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'kpi-spinner',
  styleUrls: ['./spinner.component.scss'],
  template: `
  <div class="spinner-container" [style.left.px]="left">
    <div class="spinner" [style.left]="leftSpinner">
        <img src="/assets/img/loading.gif"/>
    </div>
  </div>
  `
})
export class SpinnerComponent {

    left: number;
    leftSpinner: SafeStyle;

    constructor(
        browser: BrowserService,
        private sanitizer: DomSanitizer,
    ) {
        browser.viewportSize$.subscribe(s => {
            this.updateLeftValue(s);
        });
    }

    private updateLeftValue(size: IViewportSize) {
        this.left = size.width >= 1200 ? 220 : 0;
        this.leftSpinner = this.sanitizer.bypassSecurityTrustStyle(size.width >= 1200 ? 'calc(50% + 120px)' : 'calc(50% - 60px)');
    }

}

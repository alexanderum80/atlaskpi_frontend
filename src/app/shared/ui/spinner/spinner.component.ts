import { Component, OnInit } from '@angular/core';
import { BrowserService, IViewportSize } from '../../services/browser.service';
import { Store } from '../../services';

@Component({
  selector: 'kpi-spinner',
  styleUrls: ['./spinner.component.scss'],
  template: `
  <div class="spinner-container" [style.left.px]="left">
    <div class="spinner">
        <img src="/assets/img/loading.gif"/>
    </div>
  </div>
  `
})
export class SpinnerComponent {

    left: number;

    constructor(browser: BrowserService) {
        browser.viewportSize$.subscribe(s => {
            this.updateLeftValue(s);
        });
    }

    private updateLeftValue(size: IViewportSize) {
        this.left = size.width >= 1200 ? 220 : 0;
    }

}

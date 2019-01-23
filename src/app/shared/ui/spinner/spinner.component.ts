import { Component, OnInit } from '@angular/core';
import { BrowserService, IViewportSize } from '../../services/browser.service';
import { Store } from '../../services';

@Component({
  selector: 'kpi-spinner',
  styleUrls: ['./spinner.component.scss'],
  template: `
  <div class="spinner-container" [style.left.px]="left">
    <div class="sk-fading-circle spinner">
        <div class="sk-circle sk-circle1"></div>
        <div class="sk-circle sk-circle2"></div>
        <div class="sk-circle sk-circle3"></div>
        <div class="sk-circle sk-circle4"></div>
        <div class="sk-circle sk-circle5"></div>
        <div class="sk-circle sk-circle6"></div>
        <div class="sk-circle sk-circle7"></div>
        <div class="sk-circle sk-circle8"></div>
        <div class="sk-circle sk-circle9"></div>
        <div class="sk-circle sk-circle10"></div>
        <div class="sk-circle sk-circle11"></div>
        <div class="sk-circle sk-circle12"></div>
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

import { Component, Input } from '@angular/core';

@Component({
  selector: 'bw-preloader',
  template: `
    <div class="preloader pl-xxl pls-{{color}} {{class}}">
      <svg class="pl-circular" viewbox="25 25 50 50">
        <svg:circle class="plc-path" cx="50" cy="50" r="20"></svg:circle>
      </svg>
    </div>
  `,
})
export class PreloaderComponent {
    @Input() public  class: string;
    @Input() public  color: string; // red, blue, green, yellow, bluegray, amber, teal, gray, pink, purple

}

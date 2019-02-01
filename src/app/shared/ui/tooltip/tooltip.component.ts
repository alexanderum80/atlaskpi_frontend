import { Component } from '@angular/core';

@Component({
    template: `
      <div class="tooltip-container" [ngStyle]="{top: top}">
        <ng-content></ng-content>
      </div>
    `,
 })
export class TooltipComponent { }

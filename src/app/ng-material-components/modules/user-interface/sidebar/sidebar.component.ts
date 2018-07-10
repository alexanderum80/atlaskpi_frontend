import { Component, Input } from '@angular/core';

@Component({
    selector: 'bw-sidebar',
    template: `
        <aside class="sidebar c-overflow {{class}}" id="sidebar" style="overflow: visible"
            [ngClass]="{ 'toggled': open, 'full-height': fullHeight }">
            <div id="mCSB_1" tabindex="0" style="height: 100%">
                <div style="position: relative; top: 0px; left: 0px; width: 100%; height: 100%; overflow: auto"
                    dir="ltr">
                <ng-content></ng-content>
                </div>
            </div>
        </aside>
    `,
})
export class SidebarComponent {
    @Input() public class: string;
    @Input() public open: boolean;
    @Input() public fullHeight = false;
}

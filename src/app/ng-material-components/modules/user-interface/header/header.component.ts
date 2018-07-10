import { Component, Input } from '@angular/core';

@Component({
    selector: 'bw-header',
    template: `
        <div class="{{class}}" [class.block-header]="block">
            <ng-content></ng-content>
        </div>
    `,
})
export class HeaderComponent {
    @Input() public class: string;
    @Input() public block: boolean;
}

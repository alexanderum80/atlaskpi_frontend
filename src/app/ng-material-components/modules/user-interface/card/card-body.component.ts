import { Component, Input } from '@angular/core';

@Component({
    selector: 'bw-card-body',
    template: `
        <div class="card-body" [class.card-padding]="padded">
            <ng-content></ng-content>
        </div>
    `,
})
export class CardBodyComponent {

    @Input() public padded: boolean = false;

}

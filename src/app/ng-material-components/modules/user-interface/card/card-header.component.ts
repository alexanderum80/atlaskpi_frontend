import { Component, AfterViewInit, Input } from '@angular/core';

@Component({
    selector: 'bw-card-header',
    template: `
        <div class="card-header {{customColor}}" [class.card-padding]="padded" [class.ch-alt]="defaultHeader">
            <ng-content></ng-content>
        </div>
    `,
})
export class CardHeaderComponent {

    @Input() public padded: boolean = false;
    @Input() public color: string = 'default';

    get defaultHeader(): boolean {
        return this.color === 'default';
    }

    get customColor(): string {
        if (this.color === 'default' || this.color === 'white') {
            return '';
        }

        return 'bgm-' + this.color;
    }

}

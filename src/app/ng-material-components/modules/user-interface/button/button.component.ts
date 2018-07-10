import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

type ButtonSize = 'xs' | 'sm' | 'lg';

@Component({
    selector: 'bw-button',
    template: `
        <button
            class="btn waves-effect bgm-{{color}} c-{{simpleColor}} btn-{{size}} {{class}}"
            type="{{type}}"
            [class.btn-icon-text]="iconAndtext"
            [class.btn-block]="block"
            [class.waves-circle]="circular"
            [class.waves-float]="circular"
            [class.btn-icon]="circular"
            [class.btn-rounded]="rounded"
            [class.btn-link]="simple"
            [disabled]="disabled"
            (click)="onClick($event)">
                <i class="zmdi zmdi-{{icon}}" [class.zmdi-hc-spin]="rotateIcon" *ngIf="icon"></i>
                {{title}}
        </button>
    `,
})
export class ButtonComponent implements OnInit {
    public simpleColor: string;

    @Input() public class: string;
    @Input() public title: string;
    @Input() public color: string;
    @Input() public icon: string;
    @Input() public block: boolean;
    @Input() public circular: boolean;
    @Input() public rounded: boolean;
    @Input() public simple: boolean;
    @Input() public type = 'button';
    @Input() public rotateIcon = false;

    @Input() public size = ''; // lg, sm, xs
    @Input() public disabled: boolean;
    @Input() public preventEmitClick = true;

    @Output() private clicked = new EventEmitter();

    get iconAndtext(): boolean {
        return this.title !== undefined && this.icon !== undefined && !this.circular;
    }

    public onClick(e: MouseEvent): void {
        e.preventDefault();
        if (this.preventEmitClick === true) {
            e.stopPropagation();
        }
        this.clicked.emit(undefined);
    }

    public ngOnInit() {
        if (this.simple) {
            this.simpleColor = this.color;
            this.color = '';
        }
    }

}

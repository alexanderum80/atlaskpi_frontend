import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, Output } from '@angular/core';
import { ModalInstance, ModalResult } from './modal-instance.model';

@Component({
    selector: 'bw-modal',
    host: {
        'class': 'modal',
        'role': 'dialog',
        'tabindex': '-1',
    },
    template: `
        <div class="modal-dialog {{class}}" [ngClass]="getCssClasses()">
            <div class="modal-content">
                <ng-content></ng-content>
            </div>
        </div>
    `,
})
export class ModalComponent implements AfterViewInit, OnDestroy {

    @Input() public  class: string;
    @Input() public  animation = true;
    @Input() public  backdrop: string | boolean = true;
    @Input() public  keyboard = true;
    @Input() public  size: string;
    @Input() public  cssClass = '';
    @Input() public  openOnInit = false;

    @Output() public onClose: EventEmitter<any> = new EventEmitter(false);
    @Output() public onDismiss: EventEmitter<any> = new EventEmitter(false);
    @Output() public onOpen: EventEmitter<any> = new EventEmitter(false);

    private instance: ModalInstance;
    private visible = false;

    @HostBinding('class.fade') get fadeClass(): boolean {
        return this.animation;
    }

    @HostBinding('attr.data-keyboard') get dataKeyboardAttr(): boolean {
        return this.keyboard;
    }

    @HostBinding('attr.data-backdrop') get dataBackdropAttr(): string | boolean {
        return this.backdrop;
    }

    private overrideSize?: string = undefined;

    constructor(private element: ElementRef) {
        this.instance = new ModalInstance(this.element);

        this.instance.hidden.subscribe((result) => {
            this.visible = this.instance.visible;
            if (result === ModalResult.Dismiss) {
                this.onDismiss.emit(undefined);
            }
        });

        this.instance.shown.subscribe(() => {
            this.onOpen.emit(undefined);
        });
    }

    public ngAfterViewInit() {
        if (this.openOnInit) {
            this.open(this.size);
        }
    }

    public ngOnDestroy() {
        return this.instance && this.instance.destroy();
    }

    public routerCanDeactivate(): any {
        return this.ngOnDestroy();
    }

    public open(size?: string): Promise<void> {
        if (ModalSize.validSize(size)) { this.overrideSize = size; }

        return this.instance.open().then(() => {
            this.visible = this.instance.visible;
        });
    }

    public close(value?: any): Promise<void> {
        return this.instance.close().then(() => {
            this.onClose.emit(value);
        });
    }

    public dismiss(): Promise<void> {
        return this.instance.dismiss();
    }

    public getCssClasses(): string {
        const classes: string[] = [];

        if (this.isSmall()) {
            classes.push('modal-sm');
        }

        if (this.isLarge()) {
            classes.push('modal-lg');
        }

        if (this.cssClass !== '') {
            classes.push(this.cssClass);
        }

        return classes.join(' ');
    }

    private isSmall() {
        return this.overrideSize !== ModalSize.Large
            && this.size === ModalSize.Small
            || this.overrideSize === ModalSize.Small;
    }

    private isLarge() {
        return this.overrideSize !== ModalSize.Small
            && this.size === ModalSize.Large
            || this.overrideSize === ModalSize.Large;
    }
}

export class ModalSize {
    static Small = 'sm';
    static Large = 'lg';

    static validSize(size?: string) {
        return size && (size === ModalSize.Small || size === ModalSize.Large);
    }
}

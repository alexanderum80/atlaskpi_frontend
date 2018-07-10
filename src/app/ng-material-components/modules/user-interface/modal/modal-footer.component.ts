import { Component, Input } from '@angular/core';
import { ModalComponent } from './modal.component';

@Component({
    selector: 'bw-modal-footer',
    template: `
        <div class="modal-footer">
            <ng-content></ng-content>
            <button class="btn btn-default" *ngIf="showDefaultButtons"
                type="button" data-dismiss="modal" (click)="modal.dismiss()">{{dismissButtonLabel}}</button>
            <button class="btn btn-primary" *ngIf="showDefaultButtons"
                type="button" (click)="modal.close()">{{closeButtonLabel}}</button>
        </div>
    `,
})
export class ModalFooterComponent {
    @Input('show-default-buttons') showDefaultButtons: boolean = false;
    @Input('dismiss-button-label') dismissButtonLabel: string = 'Dismiss';
    @Input('close-button-label') closeButtonLabel: string = 'Close';
    constructor(private modal: ModalComponent) { }
}

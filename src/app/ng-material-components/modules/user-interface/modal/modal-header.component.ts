import { Component, Input } from '@angular/core';
import { ModalComponent } from './modal.component';

@Component({
    selector: 'bw-modal-header',
    template: `
        <div class="modal-header">
            <button class="close" *ngIf="showClose" type="button"
                data-dismiss="modal" aria-label="Close" (click)="modal.dismiss()">
                    <span aria-hidden="true">×</span>
            </button>
            <ng-content></ng-content>
        </div>
    `,
})
export class ModalHeaderComponent {
    @Input('show-close') showClose: boolean = false;
    constructor(private modal: ModalComponent) { }
}

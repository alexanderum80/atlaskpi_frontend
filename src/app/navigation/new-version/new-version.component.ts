import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'kpi-new-version',
    templateUrl: './new-version.component.pug',
    styleUrls: ['./new-version.component.scss']
})
export class NewVersionComponent {
    @Output() onClose = new EventEmitter();

    shouldClose = false;

    reloadApp() {
        window.location.reload();
    }

    close() {
        const that = this;
        this.shouldClose = true;

        setTimeout(() => {
            that.onClose.emit();
        }, 500);
    }
}

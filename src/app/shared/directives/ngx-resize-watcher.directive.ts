import { Directive, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';

@Directive({ selector: '[ngx-resize-watcher]' })
export class NgxResizeWatcherDirective implements AfterContentChecked {
    private latestWidth: number;

    constructor(private table: DatatableComponent, public ref: ChangeDetectorRef) {}

    ngAfterContentChecked() {
        if (this.table && this.table.element.clientWidth !== this.latestWidth) {
            this.latestWidth = this.table.element.clientWidth;
            this.table.recalculate();
            this.ref.detectChanges();
        }
    }
}

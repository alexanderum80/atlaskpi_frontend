import {
    ModalComponent
} from '../../ng-material-components';

import {
    Component,
    ViewChild
} from '@angular/core';

@Component({
    selector: 'kpi-delete-modal',
    templateUrl: './delete-modal.component.pug',
    styleUrls: ['./delete-modal.component.scss']
})
export class DeleteModalComponent {
    @ViewChild('deleteModal') deleteModal: ModalComponent;

    headerText = '';

    show(): void {
        alert('aqui');
        this.deleteModal.open();
    }


    save() {
        // do nothing
    }

    cancel() {
        // do nothing
    }
}
import { HttpEventType } from '@angular/common/http';
import { Component, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';

import { FileUploadClientService } from '../../services/upload.service';

@Component({
    selector: 'kpi-file-input',
    templateUrl: './file-input.component.pug',
    styleUrls: ['./file-input.component.scss']
})
export class FileInputComponent implements OnInit {
    @Input() fileName = 'file-1';
    @Input() label: string;
    @Input() icon = 'upload';
    @Input() color = 'black';
    @Input() backgroundColor = 'white';
    @Input() customClass: string;
    @Input() multiple = false;
    @Input() uploadMetadata: any;
    // examples: https://stackoverflow.com/questions/181214/file-input-accept-attribute-is-it-useful
    // https://html.spec.whatwg.org/multipage/input.html#attr-input-accept
    @Input() accept = 'image/*';

    @Output() selectedFiles: string[];
    @Output() onUploadComplete = new EventEmitter<any>();

    @ViewChild('myInput')
    myFileInput: any;

    allowMultipleFiles: string;
    uploadingProgressing = false;
    uploadComplete = false;
    uploadProgress = 0;

    private fileToUpload: File = null;
    private fileUploadSub: any;
    private serverResponse: any;

    constructor(private fileUploadService: FileUploadClientService) {}

    ngOnInit() {
        this.allowMultipleFiles = this.multiple ? '' : null;
    }

    handleFileInput(files: FileList) {
        const fileItem = files.item(0);
        console.log('file input has changed. The file is', fileItem);
        this.fileToUpload = fileItem;
        // submit file
        this.handleSubmit();
    }

    private handleSubmit( /*e: any, statusNgForm: NgForm, statusFormGroup: FormGroup*/ ) {
        // e.preventDefault();
        // if (statusNgForm.submitted) {

        // const submittedData = statusFormGroup.value;
        // {
        //     type: UploadTypeEnum.ProfilePicture
        // }

        this.fileUploadSub = this.fileUploadService.fileUpload(this.fileToUpload, this.uploadMetadata)
            .subscribe(
                event => this.handleProgress(event),
                error => {
                    console.log('Server error');
                });

        // statusNgForm.resetForm({});
        // }
    }

    handleProgress(event) {

        if (event.type === HttpEventType.DownloadProgress) {
            this.uploadingProgressing = true;
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
        }

        if (event.type === HttpEventType.UploadProgress) {
            this.uploadingProgressing = true;
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
        }

        if (event.type === HttpEventType.Response) {
            // console.log(event.body);
            this.uploadComplete = true;
            this.serverResponse = event.body;
            this.onUploadComplete.emit(this.serverResponse);
        }
    }
}

import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../environments/environment';
import { IUserToken } from '../models';


/* Naming NOTE
  The API's file field is `fileItem` thus, we name it the same below
  it's like saying <input type='file' name='fileItem' />
  on a standard file field
*/

export enum UploadTypeEnum {
    ProfilePicture = 'profile-picture'
}


@Injectable()
export class FileUploadClientService {
    private uploadPath = `${environment.restServer}/attachments`;

    constructor(private http: HttpClient) {}

    fileUpload(fileItem: File, extraData?: object): any {
        const apiCreateEndpoint = this.uploadPath;
        const formData: FormData = new FormData();

        formData.append('fileItem', fileItem, fileItem.name);
        if (extraData) {
            for (let key in extraData) {
                // iterate and set other form data
                formData.append(key, extraData[key])
            }
        }

        const jsonToken: IUserToken =
            JSON.parse(localStorage.getItem(environment.BEARER_KEY)) ||
            {
                access_token: ''
            };

        const req = new HttpRequest('POST', apiCreateEndpoint, formData, {
            headers: new HttpHeaders({
                'x-hostname': window.location.hostname,
                'x-access-token': jsonToken.access_token
            }),
            reportProgress: true // for progress data
        });
        return this.http.request(req);
    }

    optionalFileUpload(fileItem ? : File, extraData?: object): any {
        const apiCreateEndpoint = this.uploadPath;
        const formData: FormData = new FormData();
        let fileName;
        if (extraData) {
            for (let key in extraData) {
                // iterate and set other form data
                if (key == 'fileName') {
                    fileName = extraData[key];
                }
                formData.append(key, extraData[key])
            }
        }

        if (fileItem) {
            if (!fileName) {
                fileName = fileItem.name;
            }
            formData.append('image', fileItem, fileName);
        }
        const req = new HttpRequest('POST', apiCreateEndpoint, formData, {
            reportProgress: true // for progress data
        });
        return this.http.request(req);
    }

    // list(): Observable < any > {
    //     const listEndpoint = `${this.apiBaseURL}files/`
    //     return this.http.get(listEndpoint)
    // }

}
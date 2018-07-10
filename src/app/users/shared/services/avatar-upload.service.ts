import { Headers } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AvatarUploadService {

  constructor(private httpClient: HttpClient/* , private yourHeaderConfig: HttpHeaders */) { }

  /* postFile(fileToUpload: File): Observable<boolean> {
    const endpoint = 'your-destination-url';
    const formData: FormData = new FormData();
    formData.append('fileKey', fileToUpload, fileToUpload.name);
    return this.httpClient
      .post(endpoint, formData, { headers: this.yourHeaderConfig })
      .map(() => {
        return true; });
      //.catch((e) => this.handleError(e));
      return true;
  } */

}

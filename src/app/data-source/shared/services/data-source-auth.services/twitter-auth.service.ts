import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { IOAuthConnector, OAuthConnector,
} from '../../models/data-sources/oauth-connector.base';
import { TwitterConnector } from '../../models/data-sources/twitter-connector';

@Injectable()
export class TwitterAuthService {
  constructor(private _http: Http) { }

  // Gets
  public getToken(dataSource: IOAuthConnector): Observable<any> {
    const urlForToken = dataSource.getUrlForToken();
      return this._http.get(urlForToken).map((res: Response) => res.json())
                       .catch(error => error.json() || 'Server error. #gjh79.');
  }

  public getUserInfo(dataSource: IOAuthConnector): Observable<any> {
    const urlForAPI = dataSource.getUrlForAPI();
    return this._http.get(urlForAPI).map((res: Response) => res.json())
                     .catch(error => error.json() || 'Server error. #gjk76');
  }

  public getCurrentUrlHostname(): string {
    return window.location.protocol + '//' + window.location.host;
  }

  public connect(dataSource: IOAuthConnector): void {

      }
}

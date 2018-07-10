import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {
  IOAuthConnector, OAuthConnector,
} from '../../models/data-sources/oauth-connector.base';
import { InstagramConnector, IInstagramConnector } from '../../models/data-sources/instagram-connector';
import {
  Subscription
} from 'rxjs/Subscription';

@Injectable()
export class InstagramAuthService {
  private _subscription: Subscription[] = [];

  constructor(private _http: Http) { }

  get subscriptions(): Subscription[] {
    return this._subscription;
  }

  // Gets
  public getToken(dataSource: IOAuthConnector): Observable<any> {
    const urlForToken = dataSource.getUrlForToken();
    const params = (dataSource as IInstagramConnector).getParamsForToken();
    const headers = new Headers();
    return this._http.post(urlForToken, params, { headers: headers }).map((res: Response) => res)
      .catch(error => error || 'Server error. #gjh79.');
  }

  public getUserInfo(dataSource: IOAuthConnector): Observable<any> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    const urlForAPI = dataSource.getUrlForAPI();
    return this._http.get(urlForAPI, { headers: headers }).map((res: Response) => res.json())
      .catch(error => error.json() || 'Server error. #gjk76');
  }

  public getCurrentUrlHostname(): string {
    return window.location.origin;
  }

  public connect(dataSource: IOAuthConnector): void {
    this._subscription.push(
      this.getUserInfo(dataSource).subscribe(
        (data) => this._authorizationResult(dataSource, true),
        error => this._authorizationResult(dataSource, false)
      )
    );
  }

  private _authorizationResult(dataSource: IOAuthConnector, state: boolean): void {
    const result = {
      dataSource: dataSource,
      state: state
    };
    const addedDataSourceCallbackEvent = new CustomEvent('AddedDataSourceCallback', { 'detail': result });
    window.dispatchEvent(addedDataSourceCallbackEvent);
  }

}

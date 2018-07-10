import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ConnectorTypeEnum } from '../../models/data-sources/connector-type-enum';
import {
  IOAuthConnector, OAuthConnector,
} from '../../models/data-sources/oauth-connector.base';
import { GoogleConnector, IGoogleConnector } from '../../models/data-sources/google-connector.base';
import { GoogleAnaliticsConnector } from '../../models/data-sources/google-analitics-connector';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class GoogleAnaliticsAuthService {

  private _subscription: Subscription[] = [];

  constructor(private _http: Http) { }

  get subscriptions(): Subscription[] {
    return this._subscription;
  }

  // Gets
  public getToken(dataSource: IOAuthConnector): Observable<any> {
    const urlForToken = dataSource.getUrlForToken();
    const params = (dataSource as IGoogleConnector).getParamsForToken();
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this._http.post(urlForToken, params, { headers: headers })
      .map((res: Response) => res.json())
      .catch(error => error.json() || 'Server error. #gjh79.');
  }

  public getUserInfo(dataSource: IOAuthConnector): Observable<any> {
    const urlForApi = dataSource.getUrlForAPI();
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + dataSource.getToken());
    return this._http.get(urlForApi, { headers: headers })
      .map((res: Response) => res.json())
      .catch(error => error.json() || 'Server error. #gjk76');
  }

  public getCurrentUrlHostname(): string {
    return window.location.origin;
  }

  public connect(dataSource: IOAuthConnector) {
    this.getToken(dataSource).subscribe(
      (data) => {
        const access = data;
        if (access.access_token != null) {
          dataSource
            .setToken(access.access_token, access.token_type)
            .setRefreshToken(access.refresh_token)
            .setExpires(access.expires_in);
          this.getUserInfo(dataSource).subscribe(
            (data) => {
              dataSource.setUserId(data.username)
                .setUserLogin(data.username)
                .setAuthorized()
              this._authorizationResult(dataSource, true);
            },
            error => this._authorizationResult(dataSource, false)
          );
        } else {
          this._authorizationResult(dataSource, false);
        }
      },
      error => this._authorizationResult(dataSource, false)
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
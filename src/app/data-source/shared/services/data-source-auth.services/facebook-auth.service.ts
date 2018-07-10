import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ConnectorTypeEnum } from '../../models/data-sources/connector-type-enum';
import { IOAuthConnector, OAuthConnector,
 } from '../../models/data-sources/oauth-connector.base';
import { FacebookConnector } from '../../models/data-sources/facebook-connector';
import 'rxjs/add/operator/catch';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class FacebookAuthService {

  private _subscription: Subscription[] = [];
  constructor(private _http: Http) { }

  get subscriptions(): Subscription[] {
    return this._subscription;
  }

  // Gets
  public getToken(dataSource: IOAuthConnector): Observable<any> {
    const urlForToken = dataSource.getUrlForToken();
    return this._http.get(urlForToken).map((res: Response) => res.json()).catch(error => error.json() || 'Server error. #gjsdfg');
  }

  public getUserInfo(dataSource: IOAuthConnector): Observable<any> {
    const urlForAPI = dataSource.getUrlForAPI();
    return this._http.get(urlForAPI)
      .map((res: Response) => res.json())
      .catch(error => error.json() || 'Server error. #gjk76');
  }

  public getCurrentUrlHostname(): string {
    return window.location.origin;
  }

  public connect(dataSource: IOAuthConnector): void {
    this._subscription.push(
      dataSource.getAuthService().getToken(dataSource).subscribe(
        (data) => {
          const access = data;
          if (access.access_token != null) {
            dataSource
              .setToken(access.access_token, access.token_type)
              .setRefreshToken(access.refresh_token)
              .setExpires(access.expires_in);
            dataSource.getAuthService().getUserInfo(dataSource).subscribe(
              (data) => {
                dataSource
                  .setUserId(data.id)
                  .setUserLogin(data.name)
                  .setUrlUserImage(data.picture.data.url);
                this._authorizationResult(dataSource, true);
              },
              error => this._authorizationResult(dataSource, false)
            );
          } else {
            this._authorizationResult(dataSource, false);
          }
        },
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

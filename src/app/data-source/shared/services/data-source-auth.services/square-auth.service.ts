import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import {
  IOAuthConnector,
  OAuthConnector} from '../../models/data-sources/oauth-connector.base';
import { SquareConnector } from '../../models/data-sources/square-connector';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class SquareAuthService {

  constructor(private _http: Http) {}

  // get the current url hostname
  private _getCurrentUrlHostname(): string {
    return window.location.origin;
  }

  private _authorizationResult(dataSource: IOAuthConnector, state: boolean): void {
    const result = {
      dataSource: dataSource,
      state: state
    };

    const addedDataSourceCallbackEvent = new CustomEvent('AddedDataSourceEvent', { detail: result });
    window.dispatchEvent(addedDataSourceCallbackEvent);
  }
}

// Base class for creating oauth connectors
import { ConnectorTypeEnum } from './connector-type-enum';

export interface IOAuthConnector {
  // Get
  getType(): ConnectorTypeEnum;
  getTypeString(): string;
  getUrlMainImage(): string;
  getTitle(): string;
  getUserLogin(): string;
  getUserId(): string;
  getUrlUserImage(): string;
  getUrlForAuthorize(): string;
  getUrlForToken(): string;
  getUrlForAPI(): string;
  getToken();
  getCode();
  getUrlRedirect(): string;
  getAuthService(): any;
  getCurrentHostname(): string;
  // Set
  setUserLogin(userLogin: string): IOAuthConnector;
  setUserId(userId: string): IOAuthConnector;
  setUrlUserImage(userImage: string): IOAuthConnector;
  setAuthorized(auth?: boolean): IOAuthConnector;
  setCode(code: string): IOAuthConnector;
  setToken(token: string, tokenType?: string): IOAuthConnector;
  setRefreshToken(refreshToken: string): IOAuthConnector;
  setExpires(expires: string): IOAuthConnector;
  setAuthService(authService: any): IOAuthConnector;
  setUrlRedirect(currentHostname: string): string;
  setUrlForAuthorize(currentHostname: string): string;
  // Is
  isEnabled(): boolean;
  isAuthorized(): boolean;
  // Other
  connect(): any;
  validateRedirect(response: string): boolean;
  moveRegData(source: IOAuthConnector): IOAuthConnector;
}

export class OAuthConnector implements IOAuthConnector {
  // Properties
  protected _enable: boolean = false;
  protected _isAuthorized: boolean = false;
  protected _urlMainImage: string = '/assets/img/datasources/{typeDataSource}.DataSource.MainImage.png';
  protected _titleDataSource: string = 'no title';
  protected _userId: string = 'no Id';
  protected _userLogin: string = 'no login';
  protected _urlUserImage: string = './assets/img/datasources/default.UserImage.png';      // default user's image
  // *****  Data for restore from Api **************
  protected _typeDataSource: ConnectorTypeEnum;                         // Detect type of DataSource
  protected _token: string = 'default token';                          // Registration data in socialnet for sign request
  protected _refreshToken: string = 'default refreshToken';            // Used for Google/Youtube
  protected _code: string = 'default code';
  protected _expires: string = 'default expires';
  protected _tokenType: string = 'default tokenType';
  // ************************************************
  protected _appId: string = 'default appId';
  protected _appSecret: string = 'default appSecret';
  protected _urlForToken: string = 'default urlForToken';
  protected _urlForAuthorize: string = 'default urlForAuthorize';
  protected _urlForApi: string = 'default urlForApi';
  protected _urlRedirect: string = '{currentHostname}/redirect.html';  // default redirect
  protected _currentHostname: string = 'no domainname';                // default value
  protected _authService: any;                                          // link to Angular service

  constructor() { }
  // Get
  public getType(): ConnectorTypeEnum { return this._typeDataSource; }

  public getTypeString(): string { return ConnectorTypeEnum[this.getType()].toString(); }

  public getUrlMainImage(): string { return this._urlMainImage.replace('{typeDataSource}', this.getTypeString()); }

  public getTitle(): string { return this._titleDataSource; }

  public getUserLogin(): string { return this._userLogin; }

  public getUserId(): string { return this._userId; }

  public getUrlUserImage(): string { return this._urlUserImage; }

  public getUrlForAuthorize(): string {
    return this._urlForAuthorize
      .replace('{appId}', this._appId)
      .replace('{urlRedirect}', this.getUrlRedirect());
  }

  public getUrlForToken(): string {
    return this._urlForToken
      .replace('{appId}', this._appId)
      .replace('{urlRedirect}', this.getUrlRedirect())
      .replace('{appSecret}', this._appSecret)
      .replace('{code}', this._code);
  }

  public getUrlForAPI(): string {
    return this._urlForApi.replace('{token}', this._token);
  }

  public getUrlRedirect() { return this._urlRedirect.replace('{currentHostname}', this.getCurrentHostname()); }

  public getToken() { return this._token; }

  public getCode() { return this._code; }

  public getAuthService(): any { return this._authService; }

  public getCurrentHostname(): string { return this._currentHostname; }

  private _getCodeFromResponse(str: string): string {
    let result = '';
    let index = str.indexOf('code=');             // detect code
    if (index !== -1) {
      result = str.substring(index + 4);
      index = result.indexOf('&');                // finding end by &
      const index2 = result.indexOf('#');           // finding end by #
      if (index !== -1 && index2 !== -1) {
          if (index2 < index) {
          index = index2;
        }
      } else if (index2 > index) {
        index = index2;
      }
      if (index !== -1) {
        result = result.substring(0, index);
      }
    }
    return result;
  }

  // Set
  public setUserLogin(userLogin: string): IOAuthConnector {
    this._userLogin = userLogin;
    return this;
  }

  public setUserId(userId: string): IOAuthConnector {
    this._userId = userId;
    return this;
  }

  public setUrlUserImage(urlUserImage: string): IOAuthConnector {
    this._urlUserImage = urlUserImage;
    return this;
  }

  public setAuthorized(auth?: boolean): IOAuthConnector {
    this._isAuthorized = auth || true;
    return this;
  }

  public setCode(code: string): IOAuthConnector {
    this._code = code;
    return this;
  }

  public setToken(token: string, tokenType?: string): IOAuthConnector {
    this._token = token;
    this._tokenType = tokenType;
    return this;
  }

  public setExpires(expires: string): IOAuthConnector {
    this._expires = expires;
    return this;
  }

  public setAuthService(authService: any): IOAuthConnector {
    this._authService = authService;
    return this;
  }

  public setUrlRedirect(currentHostname: string): string {
    this._currentHostname = currentHostname;
    return this.getUrlRedirect();
  }

  public setUrlForAuthorize(currentHostname: string): string {
    this._currentHostname = currentHostname;
    return this.getUrlForAuthorize();
  }

  public setRefreshToken(refreshToken: string): IOAuthConnector {
    this._refreshToken = refreshToken;
    return this;
  }

  // Is
  public isEnabled(): boolean { return this._enable; }

  public isAuthorized(): boolean { return this._isAuthorized; }

  // Other
  public connect(): any {
    return this.getAuthService().connect(this);
  }

  public moveRegData(source: IOAuthConnector): IOAuthConnector {
    this._code = source.getCode();
    this._token = source.getToken();
    this._currentHostname = source.getCurrentHostname();
    this._urlRedirect = source.getUrlRedirect();
    return this;
  }

  public validateRedirect(response: string): boolean {          // default detect code
    this._code = '';
    const code = this._getCodeFromResponse(response);
    if (code === '') {
      return false;
    }
    this._code = code;
    return true;
  }

}

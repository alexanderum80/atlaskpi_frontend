import { IOAuthConnector, OAuthConnector } from './oauth-connector.base';
import { ConnectorTypeEnum } from './connector-type-enum';

export interface IGoogleConnector extends IOAuthConnector {
    // Get
    getParamsForToken(): any;
}

export class GoogleConnector extends OAuthConnector implements IGoogleConnector {
    protected _scope: string = 'no scope';
    protected _state: string = 'no state';
    constructor() {
        super();
        this._getConfigureConnector();
        this._urlForToken = 'https://www.googleapis.com/oauth2/v4/token';
        this._urlForAuthorize =
            'https://accounts.google.com/o/oauth2/v2/auth?scope={scope}&state={state}&redirect_uri={urlRedirect}' +
            '&include_granted_scopes=true&access_type=offline&response_type=code&client_id={appId}';
        this._urlForApi = 'https://www.googleapis.com/analytics/v3/management/accounts?access_token={token}';
    }

    public getUrlForAuthorize(): string { return this._urlTransform(this._urlForAuthorize); }

    public getParamsForToken(): any {
        return 'code=' + this._code + '&client_id=' + this._appId + '&client_secret=' + this._appSecret +
            '&redirect_uri=' + this.getUrlRedirect() + '&grant_type=authorization_code';
    }

    protected _urlTransform(url: string): string {
        return url.replace('{scope}', this._scope)
            .replace('{state}', this._state)
            .replace('{urlRedirect}', this.getUrlRedirect())
            .replace('{appId}', this._appId);
    }

    private _getConfigureConnector() {
        this._appId = '181007126912-0bhvhn65jhea1edhb7c4bc8cv54jreir.apps.googleusercontent.com';
        this._appSecret = 'K3h3Ey_NR3TKNBN5bd0nI63P';
    }
}

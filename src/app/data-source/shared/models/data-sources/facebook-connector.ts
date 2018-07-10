import { IOAuthConnector, OAuthConnector } from './oauth-connector.base'
import { ConnectorTypeEnum } from './connector-type-enum'

export class FacebookConnector extends OAuthConnector {
    constructor() {
        super();
        this._getConfigureConnector();
        this._titleDataSource = "Facebook";
        this._typeDataSource = ConnectorTypeEnum.Facebook;
        this._urlForToken = "https://graph.facebook.com/oauth/access_token?client_id={appId}&redirect_uri={urlRedirect}&client_secret={appSecret}&code={code}&scope=email,user_birthday";
        this._urlForAuthorize = "https://www.facebook.com/dialog/oauth?client_id={appId}&redirect_uri={urlRedirect}&response_type=code";
        this._urlForApi = "https://graph.facebook.com/me?fields=id,name,picture&access_token={token}";
        }

    private _getConfigureConnector(){
        this._appId = "1960032350929896";
        this._appSecret = "8cfe3b637a13f35861c4eecd45f5a646";
    }
}

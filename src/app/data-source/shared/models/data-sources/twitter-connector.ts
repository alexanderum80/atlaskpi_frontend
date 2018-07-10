import { IOAuthConnector, OAuthConnector } from './oauth-connector.base'
import { ConnectorTypeEnum } from './connector-type-enum'

export class TwitterConnector extends OAuthConnector {
    constructor() {
        super();
        this._getConfigureConnector();
        this._titleDataSource = "Twitter";
        this._typeDataSource = ConnectorTypeEnum.Twitter;
        
        this._urlForAuthorize = "https://api.twitter.com/oauth/authorize?oauth_token={urlRedirect}";
        }

    private _getConfigureConnector(){
            this._appId = "mvzC6w6yAip5d57mDBAhwtkdo";
            this._appSecret = "VP9q2iDgondzeINkzdVqux49g0veMZSJkRXQpAstSTfI3iKkEO";
        }
}

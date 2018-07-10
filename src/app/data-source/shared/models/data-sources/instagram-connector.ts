import { IOAuthConnector, OAuthConnector } from './oauth-connector.base'
import { ConnectorTypeEnum } from './connector-type-enum'

export interface IInstagramConnector extends IOAuthConnector{ 
    // Get
      getParamsForToken:any;
   }

export class InstagramConnector extends OAuthConnector implements IInstagramConnector{
    constructor() {
        super();
        this._getConfigureConnector(); 
        this._titleDataSource = "Instagram";
        this._typeDataSource = ConnectorTypeEnum.Instagram;        
        this._urlForToken = "https://api.instagram.com/oauth/access_token";
        this._urlForAuthorize = 
            "https://api.instagram.com/oauth/authorize/?client_id={appId}&redirect_uri={urlRedirect}&response_type=token";
        this._urlForApi = "https://api.instagram.com/v1/users/self/?access_token={token}";
      }

    public getParamsForToken():any{
        return "client_id=" + this._appId + "&client_secret=" + this._appSecret + "&grant_type=authorization_code" +
                      "&code=" + this._code + "&redirect_uri=" + this.getUrlRedirect();
      }

    public validateRedirect(response:string):boolean {
          let result ="";
          let index =response.indexOf( "#access_token=" );             // detect code via #
          if (index!=-1) {
            result = response.substring(index+14);
          }
          this._token = result;
          if (result = "") return false;
          return true;
        }
    
    private _getConfigureConnector(){
            this._appId = "652152c8040b4e178c387220679338e8";
            this._appSecret = "9e5f91bb746b426ba91412fc625746ba";
        }
}

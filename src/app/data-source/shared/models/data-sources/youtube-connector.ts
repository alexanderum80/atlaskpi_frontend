import { IGoogleConnector, GoogleConnector } from './google-connector.base'
import { ConnectorTypeEnum } from './connector-type-enum'

export class YoutubeConnector extends GoogleConnector{
    constructor() {
        super();
        this._titleDataSource = "Youtube";
        this._typeDataSource = ConnectorTypeEnum.Youtube;
        this._scope = "https://www.googleapis.com/auth/youtube.readonly";  
        this._state = "state_parameter_passthrough_value";                 
        }
    }
import { CustomTableConnector } from './custom-table-connector';
import { CustomCSVConnector } from './custom-csv-connector';
import { CustomExcelConnector } from './custom-excel-connector';
import { GoogleAnalyticsServerSideConnector } from './google-analytics-server-side-connector';
import { CallRailsConnector } from './callrails-connector';
import { FacebookServerSideConnector } from './facebook-server-side-connector';
import { TwitterServerSideConnector } from './twitter-server-side-connector';
import { LinkedInServerSideConnector } from './linkedin-server-side-connector';
import { InstagramServerSideConnector } from './instagram-server-side-connector';
import { QuickBooksConnector } from './quickbooks-online-connector';
import { SquareConnector } from './square-connector';
import { ConnectorTypeEnum } from './connector-type-enum';
import { getConnectorType, ServerSideOAuthConnector } from './server-side-oauth-connector.base';

export class ServerSideConnectorFactory {
    static getInstance(code: string): ServerSideOAuthConnector {
        switch (getConnectorType(code)) {
            case ConnectorTypeEnum.QuickBooksOnline:
                return new QuickBooksConnector();
            case ConnectorTypeEnum.Square:
                return new SquareConnector();
            case ConnectorTypeEnum.InstagramServerSide:
                return new InstagramServerSideConnector();
            case ConnectorTypeEnum.LinkedIn:
                return new LinkedInServerSideConnector();
            case ConnectorTypeEnum.FacebookServerSide:
                return new FacebookServerSideConnector();
            case ConnectorTypeEnum.TwitterServerSide:
                return new TwitterServerSideConnector();
            case ConnectorTypeEnum.GoogleAnalyticsServerSide:
                return new GoogleAnalyticsServerSideConnector();
            case ConnectorTypeEnum.CallRail:
                return new CallRailsConnector();
            case ConnectorTypeEnum.CustomExcel:
                return new CustomExcelConnector();
            case ConnectorTypeEnum.CustomCSV:
                return new CustomCSVConnector();
            case ConnectorTypeEnum.CustomTable:
                return new CustomTableConnector();
            default:
                return null;
        }
    }
}

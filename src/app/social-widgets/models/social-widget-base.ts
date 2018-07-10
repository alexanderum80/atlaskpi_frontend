export enum SocialWidgetType {
    twitter = 1,
    instagram = 2,
    facebook = 3,
    linkedin = 4
}

export const SocialWidgetTypeMap = {
    'twitter': SocialWidgetType.twitter,
    'instagram': SocialWidgetType.instagram,
    'facebook': SocialWidgetType.facebook,
    'linkedin': SocialWidgetType.linkedin
};

export interface ISocialWidgetHistoricalData {
    value: number;
    period: string;
}

export interface ISocialWidget {
    connectorId: string;
    name: string;
    icon: string;
    value: number;
    valueDescription: string;
    historicalData: ISocialWidgetHistoricalData;
    type: SocialWidgetType;
}

export class SocialWidgetBase implements ISocialWidget {
    connectorId: string;
    name: string;
    value: number;
    valueDescription: string;
    historicalData: ISocialWidgetHistoricalData;
    type: SocialWidgetType;

    constructor(data: ISocialWidget) {
        this.connectorId = data.connectorId;
        this.name = data.name;
        this.value = data.value;
        this.valueDescription = data.valueDescription;
        if (data.historicalData) {
            this.historicalData = {
                value: data.historicalData.value,
                period: data.historicalData.period
            };
        }
        this.type = SocialWidgetTypeMap[data.type];
    }

    protected _iconUrl = '/assets/img/datasources/{type}.logo.png';

    public getTypeString(): string {
        return SocialWidgetType[this.type].toString();
    }

    get icon(): string {
        return this._iconUrl.replace('{type}', this.getTypeString());
    }
}

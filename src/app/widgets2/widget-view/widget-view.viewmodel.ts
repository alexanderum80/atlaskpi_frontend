import { Injectable } from '@angular/core';

import { MenuItem } from '../../ng-material-components';
import { Field, ViewModel } from '../../ng-material-components/viewModels';
import { INumericWidgetData, IWidgetViewData } from './../shared/models/widget';
import { IWidgetData } from './../widget-preview/widget-preview.viewmodel';

@Injectable()
export class WidgetViewViewModel extends ViewModel < IWidgetViewData > {

    constructor() {
        super(null);
    }

    @Field({
        type: String
    })
    name: string;
    description: string;
    size: string;
    type: string;
    color: string;
    format: string;

    public chartWidgetData ? : string;
    public numericWidgetData ? : INumericWidgetData;

    public descriptionAnimation: any;
    public showDescription = false;

    public parsedChartData: any;

    public widgetActionItems: MenuItem[] = [{
        id: 'info',
        icon: 'info-outline',
        active: true
    }];

    initialize(model: IWidgetViewData): void {
        this.onInit(model);
    }

    public updateViewModel(data: IWidgetData) {
        Object.assign(this, data);
        switch (this.type) {
            case 'chart':
                if (this.chartWidgetData) {
                    this.parsedChartData = JSON.parse(this.chartWidgetData);
                }
                this.numericWidgetData = null;
                break;
            case 'numeric':
                this.chartWidgetData = null;
                break;
        }
    }

    get isDummy(): boolean {
        return !this.chartWidgetData && !this.numericWidgetData;
    }
}
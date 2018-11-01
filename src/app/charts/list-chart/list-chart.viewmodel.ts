import { IChart } from './../shared/models/chart.models';
import { Injectable } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { IUserInfo } from '../../shared/models/user';
import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { IListItem } from 'src/app/shared/ui/lists/list-item';
import { ChartGalleryService } from '../shared';

@Injectable()
export class ListChartViewModel extends ViewModel<any> {
    protected _user: IUserInfo;
    private _chartGalleryService: ChartGalleryService;

    private _chartsItemList: IListItem[] = [];

    private _menuItems = [{
        id: 'more-options',
        icon: 'more-vert',
        children: [{
                id: 'edit',
                title: 'Edit',
                icon: 'edit'
            },
            {
                id: 'delete',
                title: 'Delete',
                icon: 'delete'
            },
            {
                id: 'clone',
                title: 'Clone',
                icon: 'copy'
            }
        ]
    }];

    constructor(userService: UserService) {
        super(userService);
    }
    public initialize(model: any): void {
        this.onInit(model);
    }

    get menuItems() {
        return this._menuItems;
    }

    setChartsList(charts: IChart[]) {
        this._chartsItemList = charts.map(c => {
            const chartDefinition = JSON.parse(c.chartDefinition);
            let chartType = chartDefinition.chart.type;
            let chartOption = chartDefinition.plotOptions && chartDefinition.plotOptions[chartType].stacking ?
                            chartDefinition.plotOptions[chartType].stacking :
                            'basic';

            if (chartOption === 'normal') {
                chartOption = 'stacked';
            }

            switch (chartType) {
                case 'pie':
                    if (chartOption === 'basic') {
                        chartOption = 'pie';
                    }
                    break;
                case 'line':
                    if (chartDefinition.chart.inverted === true) {
                        chartOption = 'inverted';
                    }
                    break;
                case 'spline':
                    chartType = 'line';
                    chartOption = 'spline';
                    break;
            }

            return {
                id: c._id,
                imagePath: `../../../assets/img/charts/${chartType}/${chartOption}.svg`,
                title: c.title,
                subtitle: c.subtitle,
                extras: {
                   // access: d.accessLevels
                },
                visible: true
            };
        });

    }

    get chartsList() {
        return this._chartsItemList;
    }

}

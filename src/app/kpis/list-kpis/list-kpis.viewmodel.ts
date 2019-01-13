// Angular Imports
import { IUserInfo } from '../../shared/models/user';
import { UserService } from '../../shared/services/user.service';
import { Injectable } from '@angular/core';

import { Field, ViewModel } from '../../ng-material-components/viewModels';
import { IKPI, KPITypeEnum } from '../../shared/domain/kpis/kpi';
import { IListItem } from '../../shared/ui/lists/list-item';
import { ISearchArgs } from '../../shared/ui/lists/item-list/item-list.component';
import { MenuItem } from '../../dashboards/shared/models';
import * as moment from 'moment-timezone';

// App Code
interface IFilter {
    search: string;
}

const ImageMap = {
    simple: '/assets/img/kpis/puzzle-simple.jpg',
    complex: '/assets/img/kpis/puzzle-complex.jpg',
    externalsource: '/assets/img/kpis/external-source-kpi.jpg'
};

@Injectable()
export class ListKpisViewModel extends ViewModel<IFilter> {
    private _kpis: IKPI[];
    private _kpiItemList: IListItem[];
    protected _user: IUserInfo;

    public menuItems:  MenuItem[] = [{
        id: 'more-options',
        icon: 'more-vert',
        children: [{
                id: 'edit',
                title: 'Edit',
                icon: 'edit'
            },
            {
                id: 'clone',
                title: 'Clone',
                icon: 'copy'
            },
            {
                id: 'delete',
                title: 'Delete',
                icon: 'delete'
            }]
        }];

    constructor(userService: UserService) {
        super(userService);
    }

    get kpis(): IKPI[] {
        return this._kpis;
    }

    set kpis(list: IKPI[]) {
        if (list === this._kpis) {
            return;
        }

        this._kpis = list;
        this._kpiItemList = this._kpis.map(d => {
            return {
                id: d._id,
                imagePath: ImageMap[d.type] || '',
                title: d.name,
                subtitle: d.description,
                extras: {
                    tags: d.tags ? d.tags.join(', ') : null
                },
                createdBy: d.createdBy,
                createdDate: moment(d.createdDate),
                updatedBy: d.updatedBy,
                updatedDate: moment(d.updatedDate),
                orderFields: [{fieldName: d.createdBy ?  Object.getOwnPropertyNames(d)[6] : null,
                               fieldValue: d.createdBy ?  d.createdBy : null, descripcion: 'Created By'},
                              {fieldName: d.createdDate ? Object.getOwnPropertyNames(d)[7] : null,
                               fieldValue: d.createdDate ? moment(d.createdDate) : null, descripcion: 'Created Date'}]
            };
        });
    }

    get kpiItems(): IListItem[] {
        return this._kpiItemList;
    }


    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }

}

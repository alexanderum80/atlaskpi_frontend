import { IListItem } from '../ui/lists/list-item';
import { MenuItem } from '../../ng-material-components/models';
import { isEmpty, isBoolean } from 'lodash';

export function visibleMenuItem(): MenuItem {
    return {
        id: 'visible',
        title: 'Visible',
        icon: 'eye'
    };
}

export function notVisibleMenuItem(): MenuItem {
    return {
        id: 'notvisible',
        title: 'Not Visible',
        icon: 'eye-off'
    };
}

export class VisibleActionItemHelper {
    private static readonly compareToUrl = '/dashboards/list';

    static updateActionItem(routeUrl: string, item: IListItem, actionItems: MenuItem[]): void {
        // do something
        if (!this.canUpdateActionItem(routeUrl, actionItems, item)) {
            return;
        }

        const children: MenuItem[] = actionItems[0].children;
        const checkVisibleItemList: string[] = ['visible', 'notvisible'];

        let visibleItem: MenuItem = children.find(c => checkVisibleItemList.indexOf(c.id) !== -1);
        const otherItems: MenuItem[] = children.filter(c => checkVisibleItemList.indexOf(c.id) === -1);

        if (visibleItem) {
            if (item.visible) {
                visibleItem = notVisibleMenuItem();
            } else {
                visibleItem = visibleMenuItem();
            }

            otherItems.push(visibleItem);
            actionItems[0].children = otherItems;
        }

    }

    private static canUpdateActionItem(routeUrl: string, actionItems: MenuItem[], item: IListItem): boolean {
        return this.menuItemExists(actionItems) &&
               this.visibleFieldExist(item) &&
               this.isRouteDashboardList(routeUrl);
    }

    private static isRouteDashboardList(routeUrl: string) {
        return this.compareToUrl === routeUrl;
    }

    private static visibleFieldExist(item: IListItem): boolean {
        return !isEmpty(item) || isBoolean(item.visible);
    }

   private static  menuItemExists(actionItems: MenuItem[]): boolean {
       if (!Array.isArray(actionItems)) {
           return false;
       }
        return (actionItems as any).length ||
               !isEmpty(actionItems[0].children);
    }
}

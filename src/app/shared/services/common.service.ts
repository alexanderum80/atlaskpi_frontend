import { MenuItem } from '../../ng-material-components';
import { Injectable } from '@angular/core';
import { isNull, isUndefined } from 'lodash';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class CommonService {
    static reg_escape(value: string): string {
        return value.replace(/[-\*\$\&#%\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    static unsubscribe(subscription: Subscription[]): void {
        if (!subscription || !subscription.length) {
            return;
        }
        subscription.forEach(s => {
            if (CommonService._canUnsubscribe(s)) {
                s.unsubscribe();
            }
        });
    }

    private static _canUnsubscribe(s: Subscription): boolean {
        return s && !s.closed &&
               (typeof s.unsubscribe === 'function');
    }

    disableActionItems(actionItems: MenuItem[], compareItems: string[], activity?: boolean): void {
        if (!actionItems.length || !compareItems.length) {
            return;
        }

        const hasPermission = (isNull(activity) || isUndefined(activity)) ? true : activity;

        actionItems.forEach(item => {
            if (compareItems.indexOf(item.id) !== -1) {
                item.disabled = hasPermission;
            }
        });
    }

    disableChildrenActionItems(actionItems: MenuItem[], compareItems: string[], activity?: boolean) {
        if (!actionItems.length || !compareItems.length) { return; }
        const actionObject = actionItems[0];

        if (!actionObject.children || !actionObject.children.length) { return; }
        const children = actionObject.children;
        const bool = (isNull(activity) || isUndefined(activity)) ? true : activity;

        children.forEach(c => {
            if (compareItems.indexOf(c.id) !== -1) {
                c.disabled = bool;
            }
        });
        actionItems[0].children = children;
    }
}

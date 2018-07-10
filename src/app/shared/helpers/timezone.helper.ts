import { SelectionItem } from '../../ng-material-components';

import * as moment from 'moment';
import * as moment_timezone from 'moment-timezone';

export function generateTimeZoneOptions(): SelectionItem[] {
    const timeZones = moment_timezone.tz.names();
    const offsetTmz = [];

    const list = [];

    for (const i in timeZones) {
      if (timeZones[i]) {
        const title = '(GMT' + moment_timezone.tz(timeZones[i]).format('Z') + ')' + timeZones[i];
        list.push(new SelectionItem(timeZones[i], title));
      }
    }

    return list;
}

import {
    Injectable
} from '@angular/core';

import {
    ILegendColorConfig
} from '../show-map/show-map.component';

export const legendColors: ILegendColorConfig[] = [{
        color: 'yellow',
        min: 0.01,
        max: 5000
    },
    {
        color: 'lightblue',
        min: 5001,
        max: 25000
    },
    {
        color: 'pink',
        min: 25001,
        max: 50000
    },
    {
        color: 'green',
        min: 50001,
        max: 250000
    },
    {
        color: 'darkblue',
        min: 250001,
        max: 500000
    },
    {
        color: 'red',
        min: 500001,
        max: 1000000
    },
    {
        color: 'purple',
        min: 1000001,
        max: 5000000
    },
    {
        color: 'black',
        min: 5000001,
        max: 5000000000
    }
];

@Injectable()
export class LegendService {

    constructor() {}

    getLegendColors(): ILegendColorConfig[] {
        return legendColors;
    }
}

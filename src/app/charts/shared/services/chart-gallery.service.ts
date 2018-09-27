import { TooltipFormats } from '../ui/chart-format-info/tooltip-formats';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { ChartType } from '../models';
import { IChartGalleryItem } from '../models';
import { SelectionItem } from '../../../ng-material-components';
import { deCamelCase } from '@swimlane/ngx-datatable/release/utils';

interface IChartGalleryItemWithType {
    type: ChartType | string;
    item: IChartGalleryItem;
}

@Injectable()
export class ChartGalleryService {
    // private _toolTipList: any[] = TooltipFormats.filter(tip => tip.id !== 'multiple' && tip.id !== 'multiple_percent');
    private _toolTipList: any[] = [];
    private _sortingCriteriaList: SelectionItem[] = [];
    private sortingCriteriaListBS = new BehaviorSubject<SelectionItem[]>(this._sortingCriteriaList);
    private _activeChartSubject: Subject<IChartGalleryItem> = new Subject<IChartGalleryItem>();
    private _toolTipLisSubect: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(this._toolTipList);

    private _charts: IChartGalleryItemWithType[];

    constructor(private _http: Http) { }

    get sortingCriteriaList$(): Observable<SelectionItem[]> {

        return this.sortingCriteriaListBS.asObservable();
    }

    getCharList(): Observable<any> {
        return this._http.get('assets/data/charts/chart-list.json')
            .map(res => res.json());
    }

    getChartSampleDefinition(type: string, item: IChartGalleryItem): Observable<IChartGalleryItem> {
        return this._http.get(`assets/data/charts/chart-configs/${type}/${item.configName}.json`)
            .map(res => {
                item.sampleDefinition = res.json();
                return item;
            });
    }


    get activeChart$() {
        return this._activeChartSubject.asObservable();
    }

    get toolTipList$(): Observable<any[]> {
        return this._toolTipLisSubect.asObservable().distinctUntilChanged();
    }

    setActive(definition: IChartGalleryItem) {
        this._activeChartSubject.next(definition);
    }

    updateToolTipList(chartType: string) {
        switch (chartType.toLowerCase()) {
            case 'pie':
            case 'pie 3d':
            case 'donut':
            case 'donut 3d':
                this._toolTipList = TooltipFormats.filter(tip =>
                    tip.id !== 'multiple' && tip.id !== 'multiple_percent' &&
                    tip.id !== 'multiple_low_high' && tip.id !== 'multiple_high_low' &&
                    tip.id !== 'multiple_percent_low_high' && tip.id !== 'multiple_percent_high_low');
                this._toolTipLisSubect.next(this._toolTipList);
                break;
            default:
                this._toolTipList = TooltipFormats.filter(tip => {
                    return tip.id !== 'pie_percent' && tip.id !== 'pie_total' && tip.id !== 'pie_total_percent';
                });
                this._toolTipLisSubect.next(this._toolTipList);
                break;
        }
    }

    updateSortingCriteriaList(fgValues: any, series: any) {

        const groupingValue = fgValues.grouping;
        const frequencyValue = fgValues.frequency;
        const comparisonValue = fgValues.comparison;
        const daterangeValue = fgValues.predefinedDateRange;

        if (!groupingValue && frequencyValue && frequencyValue.length > 0) {
            // not Grouping & frequency
            this._sortingCriteriaList = [
                {
                    id: 'frequency',
                    title: 'Frequency',
                    selected: false,
                    disabled: false
                },
                {
                    id: 'values',
                    title: 'Values',
                    selected: false,
                    disabled: false
                }

            ];
        } else if (groupingValue && groupingValue.length > 0 && !frequencyValue) {
            // Grouping & not frequency
            this._sortingCriteriaList = [
                {
                    id: 'categories',
                    title: 'Categories',
                    selected: false,
                    disabled: false
                },
                {
                    id: 'values',
                    title: 'Values',
                    selected: false,
                    disabled: false
                }
            ];
        } else if (groupingValue && groupingValue.length > 0 && frequencyValue && frequencyValue.length > 0) {
            // Grouping & frequency
            this._sortingCriteriaList = [
                {
                    id: 'frequency',
                    title: 'Frequency',
                    selected: false,
                    disabled: false
                },
                {
                    id: 'groupingAlphabetically',
                    title: 'Grouping alphabetically',
                    selected: false,
                    disabled: false
                },
                {
                    id: 'valuesTotal',
                    title: 'Values (total)',
                    selected: false,
                    disabled: false
                }
            ];
            if (comparisonValue) {
                this._sortingCriteriaList.push(
                    {
                        id: 'valuesTotalMain',
                        title: 'Values (total) ' + daterangeValue,
                        selected: false,
                        disabled: false
                    }
                );
                this._sortingCriteriaList.push(
                    {
                        id: 'valuesTotalPrevious',
                        title: 'Values (total) ' + deCamelCase(comparisonValue).toLocaleLowerCase(),
                        selected: false,
                        disabled: false
                    }
                );
            }
            // add items with data
            if (Array.isArray(series)) {
                series.forEach(s => {
                    this._sortingCriteriaList.push(
                        {
                            id: s.name,
                            title: s.name,
                            selected: false,
                            disabled: false
                        }
                    );
                });
            }
        }
        this.sortingCriteriaListBS.next(this._sortingCriteriaList);
    }
}

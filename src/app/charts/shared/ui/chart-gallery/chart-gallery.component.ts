import { map, filter } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { IChartGalleryItem } from '../../models';
import { ChartGalleryService } from '../../services';

@Component({
  selector: 'kpi-chart-gallery',
  templateUrl: './chart-gallery.component.pug',
  styleUrls: ['./chart-gallery.component.scss'],
})
export class ChartGalleryComponent {
    charts: IChartGalleryItem[] = [];
    chartCategories: string[] = [];

    private _selectedSubscription: Subscription;
    private _type: string;

    constructor(private _galleryService: ChartGalleryService) {
        const that = this;
        _galleryService.getCharList().subscribe(charts => {
            that.charts = charts;
            if (!_galleryService.showMap) {
                that.charts['others'] = that.charts['others'].filter(c => c.name !== 'map');
            }
            that.chartCategories = Object.keys(charts);
            if (that.charts['others'].length === 0) {
                that.chartCategories = that.chartCategories.filter(c => c !== 'others');
            }
            if (!_galleryService.showChart) {
                that.chartCategories = that.chartCategories.filter(c => c === 'others');
            }
        });
    }

}

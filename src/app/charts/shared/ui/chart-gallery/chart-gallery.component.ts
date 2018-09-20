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
            that.chartCategories = Object.keys(charts);
        });
    }

}

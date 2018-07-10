import { ChartGalleryService } from '../../services';
import { IChartGalleryItem } from '../../models/chart.models';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'kpi-chart-gallery-item',
  templateUrl: './chart-gallery-item.component.pug',
  styleUrls: ['./chart-gallery-item.component.scss'],
//   providers: [ ChartGalleryService ]
})
export class ChartGalleryItemComponent implements OnInit  {
    @Input() item: IChartGalleryItem;
    @Input() type: string;
    @Input() width = 150;

    imageSrc: String;
    hover = false;
    selected: boolean;

    private _selectedSubscription: Subscription;

    constructor(private _chartGalleryService: ChartGalleryService) { }

    ngOnInit() {
        const that = this;
        this._selectedSubscription = this._chartGalleryService.activeChart$.subscribe((chart) => {
            that.selected = chart.name === that.item.name;
        });
    }

    @HostListener('mouseenter')
    onMouseEnter() {
        this.hover = true;
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        this.hover = false;
    }

    clicked(e) {
        this.item.type = this.type;
        const that = this;
        this._chartGalleryService.activeChart$.subscribe(item => {
            that._chartGalleryService.updateToolTipList(item.name);
        });
        this._chartGalleryService.setActive(this.item);
    }

    // private _getImageSrc(): string {
    //     let basePath = '/img/charts';
    //     let imageName = '';

    //     switch (this.definition.type) {
    //         case ChartType.Bar:
    //             imageName = 'column-drilldown-default.svg';
    //             break;
    //         case ChartType.Line:
    //             imageName = 'line-basic-default.svg';
    //             break;
    //         case ChartType.Pie:
    //             imageName = 'pie-legend-default.svg';
    //             break;
    //     }

    //     return `${basePath}/${imageName}`;
    // }

}

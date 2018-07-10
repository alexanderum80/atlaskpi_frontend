import { Component, ElementRef, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { filter, map } from 'lodash';
import SweetAlert from 'sweetalert2';

import { ModalComponent } from '../../ng-material-components';
import { SelectionItem } from '../../ng-material-components/models';
import { HelpCenterService } from './help-center.service';
import { TitleVideoComponent } from './title-video/title-video.component';


export interface IHelpCenter {
    name: string;
    duration: string;
    url: string;
}

export interface IHelpCenterDataResponse {
    helpCenter: IHelpCenter[];
}


export class HelpCenterItems extends SelectionItem {
    constructor(
        public url: string,
        public viewed: boolean
    ) {
        super();
    }
}

@Component({
    selector: 'kpi-help-center',
    templateUrl: './help-center.component.pug',
    styleUrls: ['./help-center.component.scss']
})
export class HelpCenterComponent implements OnInit {
    videoPlayer: ElementRef;

    @Output() onClose = new EventEmitter();

    @ViewChild('viedoPlayer') set content(content: ElementRef) {
        if (content) {
            this.videoPlayer = content;
        }
    }

    @ViewChild('titleVideo') titleVideo: TitleVideoComponent;
    @ViewChild('titleVideolg') titleVideolg: TitleVideoComponent;
    @ViewChild('modal') modal: ModalComponent;

    toggled = true;
    toggledBottom = false;
    countVideo = 1;
    video = [];
    percent: number;
    viewed = [1];
    finish = false;

    items: HelpCenterItems[] = [];
    readonly percentSymbol = '%';

    constructor(private _helpCtrService: HelpCenterService) {
        this._subscribeToVideoItems();
    }

    ngOnInit() {
        this._iniVideo();
    }

    toggleOptions() {
        this.toggled = !this.toggled;
    }

    toggledBottoms() {
        this.toggledBottom = !this.toggledBottom;
    }

    setViewed(id: any) {
        if (this.viewed.indexOf(id) === -1) {
            this.viewed.push(id);
        }
        this.countVideo = this.viewed.length;
    }

    next(id: any, next: any) {
        const that = this;
        if (next === true) {
            id = id + 1;
            this.setViewed(id);
        } else {
            if (this.titleVideo.item.id) {
                id = this.titleVideo.item.id;
                this.setViewed(id);
            }
            if (this.titleVideolg.item.id) {
                id = this.titleVideolg.item.id;
                this.setViewed(id);
            }
        }

        if (this.countVideo <= this.items.length) {
            const video = map(filter(that.items, {
                'id': id
            }));
            this.titleVideo.nextItem(video[0], this.items);
            this.titleVideolg.nextItem(video[0], this.items);
            this.video = video;
            this._percent();
        } else {
            if (this.finish === true) {
                return;
            }

            this.finish = true;

            SweetAlert({
                title: 'Congratulations, you finished this tutorial',
                text: 'Now you can try out what you’ve learnt by yourself, have fun!',
                type: 'success'
            }).then(resp => {
                this.cancel();
            });
        }
    }

    cancel() {
        this.videoPlayer.nativeElement.pause();
        this.modal.close();
        this.onClose.emit(null);

    }

    private _percent() {
        const that = this;
        if (that.countVideo <= that.items.length) {
            this.percent = Math.round(((that.countVideo) * 100) / that.items.length);
        }
    }

    private _iniVideo() {
        const that = this;
        const actual = that.videoPlayer;
        if (!actual || !actual.nativeElement.src) {
            this.video[0] = that.items[0];
            this.titleVideo.items = that.items;
            this.titleVideolg.items = that.items;
            this._percent();
        }

    }

    private _subscribeToVideoItems(): void {
        const that = this;

        if (this._helpCtrService.videoItems && this._helpCtrService.videoItems.length) {
            this._mapVideoItems(this._helpCtrService.videoItems);
        } else {
            this._helpCtrService.videoItems$.subscribe((data: IHelpCenter[]) => {
                that._mapVideoItems(data);
            });
        }
    }

    private _mapVideoItems(items: IHelpCenter[]): void {
        if (!items || !items.length) {
            return;
        }

        this.items = items.map((res: IHelpCenter, i: number) => ({
            id: i + 1,
            title: `${res.name}${res.duration}`,
            url: res.url,
            selected: i === 0,
            viewed: false
        }));
    }

}
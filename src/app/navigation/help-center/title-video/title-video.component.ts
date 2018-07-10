import { Component, OnInit, EventEmitter } from '@angular/core';
import { Input, Output } from '@angular/core';
import { pull, filter, forEach, find } from 'lodash';

@Component({
  selector: 'kpi-title-video',
  templateUrl: './title-video.component.pug',
  styleUrls: ['./title-video.component.scss']
})
export class TitleVideoComponent implements OnInit {
  @Output() selectedEvent = new EventEmitter();

  items = [];
  item = {id: 0, title: '', url: '', selected: '', viewed: false};
  viewed = [1];

  constructor() { }

  ngOnInit() {
  }

  setViewed(id: any) {
    if (this.viewed.indexOf(id) === -1) {
      this.viewed.push(id);
    }
  }

  selectItem(item: any) {
    this.item = item;
    this.setViewed(item.id);
    this.selectedEvent.emit();
  }

  nextItem(item: any, items: any) {
    this.setViewed(item.id);
    this._selected(item, items);
  }

  private _selected(item: any, items: any) {
      const newitems = [];
      forEach(items , element => {
        if (element.id === item.id) {
          newitems.push({
            id: element.id,
            title: element.title,
            url: element.url,
            selected: true,
            viewed: true
          });
        } else {
          let viewed = false;
          const contain = this.viewed.indexOf(element.id);
          if (contain !== -1) {
            viewed = true;
          }
          newitems.push({
            id: element.id,
            title: element.title,
            url: element.url,
            selected: false,
            viewed: viewed
          });
        }
      });
      this.items = newitems;
  }
}


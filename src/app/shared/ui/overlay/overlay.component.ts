import { Component, OnInit, Input
 } from '@angular/core';

@Component({
  selector: 'kpi-overlay',
  templateUrl: './overlay.component.pug',
  styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent implements OnInit {

  showing = false;
  effect: string;

  @Input() active = false;
  @Input() openEffect = 'zoomIn';
  @Input() closeEffect = 'zoomOut';
  @Input() opacity = 0.8;
  @Input() backgroundColor = '#05050c';

  ngOnInit() {
    this.effect = this.openEffect;

    if (this.active) {
        this.show();
    }
  }

  show() {
    this.showing = true;
    this.effect = this.openEffect;
  }

  hide() {
    this.effect = this.closeEffect;

    setTimeout(() => {
      this.showing = false;
    }, 1000);
  }

  toggle() {

    if (this.showing) {
      this.hide();
    } else {
      this.show();
    }
  }

}

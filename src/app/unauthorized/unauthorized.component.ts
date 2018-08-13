import { Component, OnInit } from '@angular/core';
import { WindowService } from '../shared/services';

@Component({
  selector: 'kpi-unauthorized',
  templateUrl: './unauthorized.component.pug',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent {

  constructor(private windowService: WindowService) { }

  goBack() {
    this.windowService.nativeWindow.history.back();
  }

}

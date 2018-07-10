import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'kpi-empty-widget-list',
  templateUrl: './empty-widget-list.component.pug',
  styleUrls: ['./empty-widget-list.component.scss']
})
export class EmptyWidgetListComponent {

    constructor(private _router: Router) { }

    addWidget() {
        this._router.navigateByUrl('widgets2/new');
    }
}

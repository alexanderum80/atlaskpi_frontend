import { AddWidgetActivity } from '../../shared/authorization/activities/widgets/add-widget.activity';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services';
import { NoWidgetViewModel } from './no-widgets.viewmodel';

@Component({
  selector: 'kpi-no-widgets',
  templateUrl: './no-widgets.component.pug',
  styleUrls: ['./no-widgets.component.scss'],
  providers: [NoWidgetViewModel, AddWidgetActivity]
})
export class NoWidgetsComponent implements OnInit {

    constructor(
        private _router: Router,
        public vm: NoWidgetViewModel,
        public addWidgetActivity: AddWidgetActivity
        ) { }

    ngOnInit() {
        this.vm.addActivities([this.addWidgetActivity]);
    }

    addWidget() {
        this._router.navigateByUrl('/widgets/new');
    }

}

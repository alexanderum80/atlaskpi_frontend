import { Component, OnInit } from '@angular/core';
import { AddFunnelActivity } from '../../shared/authorization/activities/funnel/add-funnel.activity';
import { NoFunnelViewModel } from './no-funnel.viewmodel';
import { Router } from '@angular/router';

@Component({
  selector: 'kpi-no-funnel',
  templateUrl: './no-funnel.component.pug',
  styleUrls: ['./no-funnel.component.scss'],
  providers: [ AddFunnelActivity, NoFunnelViewModel ]
})
export class NoFunnelComponent {

  constructor(
    private _router: Router,
    public vm: NoFunnelViewModel,
    public addSlideshowActivity: AddFunnelActivity) {
      this.vm.addActivities([this.addSlideshowActivity]);
  }

  onAddFunnel() {
    this._router.navigateByUrl('/funnels/new');
  }

}

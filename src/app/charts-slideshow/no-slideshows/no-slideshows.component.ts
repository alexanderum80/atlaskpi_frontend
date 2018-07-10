import { AddSlideshowActivity } from '../../shared/authorization/activities/slideshows/add-slideshow.activity';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NoSlideShowsViewModel } from './no-slideshows.viewmodel';

@Component({
  selector: 'kpi-no-slideshows',
  templateUrl: './no-slideshows.component.pug',
  styleUrls: ['./no-slideshows.component.scss'],
  providers: [NoSlideShowsViewModel, AddSlideshowActivity]
})
export class NoSlideshowsComponent {

  constructor(
    private _router: Router,
    public vm: NoSlideShowsViewModel,
    public addSlideshowActivity: AddSlideshowActivity) {
      this.vm.addActivities([this.addSlideshowActivity]);
  }

  onAddSlideshow() {
    this._router.navigateByUrl('/charts-slideshow/add');
  }

}

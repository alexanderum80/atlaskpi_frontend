import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mobile-welcome',
  templateUrl: './mobile-welcome.component.pug',
  styleUrls: ['./mobile-welcome.component.scss']
})
export class MobileWelcomeComponent implements OnInit {

  constructor(private _router: Router) { }

  ngOnInit() {
  }

  navigateTo(address: string) {
    this._router.navigate([address]);
  }

}

import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AppointmentGuardService  implements CanActivate{

  constructor( _route: Router ) { 
    

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      return true;
  }

}

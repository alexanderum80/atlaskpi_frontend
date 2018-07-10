import { SelectionItem } from '../../ng-material-components';
import { generateTimeZoneOptions } from '../../shared/helpers/timezone.helper';
import { CommonService } from '../../shared/services/common.service';
import { Apollo } from 'apollo-angular';
import { UserService } from '../../shared/services/user.service';
import { FormGroup } from '@angular/forms';
import { Component, Input, OnDestroy } from '@angular/core';
import { rolesApi } from './graphqlActions/user-form.actions';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'kpi-user-form',
  templateUrl: './user-form.component.pug',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnDestroy {
  @Input() fg: FormGroup = new FormGroup({});

  roles: any;
  timeZoneList: SelectionItem[] = generateTimeZoneOptions();

  private _subscription: Subscription[] = [];

  constructor(private _userService: UserService, private _apollo: Apollo) {
    const that = this;
    this._subscription.push(this._apollo.watchQuery({
      query: rolesApi.all,
      fetchPolicy: 'network-only'
      })
      .valueChanges.subscribe(({data}) => {
        that.roles = (<any>data).findAllRoles;

        if (!that.roles) {
          return;
        }

        setTimeout(() => {
          const semiAdminAssignAllow = this._userService.hasPermission('Assign Smi-Admin', 'Access');
          const adminAssignAllow = this._userService.hasPermission('Assign Admin', 'Access');

          if (!semiAdminAssignAllow) {
            that.roles = that.roles.filter(role => role.name !== 'semiAdmin');
          }

          if (!adminAssignAllow) {
            that.roles = that.roles.filter(role => role.name !== 'admin');
          }
        }, 100);
      }));
  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  updateUserFormValues(user: any) {
    if (user) {
      this.fg.controls['firstName'].setValue(user.profile.firstName || null);
      this.fg.controls['lastName'].setValue(user.profile.lastName || null);
      this.fg.controls['email'].setValue(user.emails[0].address);
      this.fg.controls['timezone'].setValue(user.profile.timezone || null);


      for (let i = 0; i < this.roles.length; i++) {
        const checked = (user.roles.find(role => role.name === this.roles[i].name)) !== undefined;
        this.fg.controls[this.roles[i].name].setValue(checked);
      }

    }
  }

}

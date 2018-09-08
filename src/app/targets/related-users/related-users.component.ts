import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { User } from '../../shared/models';
import { ApolloService } from '../../shared/services/apollo.service';
import { UsersNew, UserAll } from '../shared/models/targets.model';
import { Subscription } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { MenuItem } from '../../ng-material-components';
import { userApi } from './users-actions';
import { UserService } from '../../shared/services/user.service';
import { IUserInfo } from '../../shared/models/user';
import { filter, clone, forEach } from 'lodash';

@Component({
  selector: 'kpi-related-users',
  templateUrl: './related-users.component.pug',
  styleUrls: ['./related-users.component.scss']
})
export class RelatedUsersComponent implements OnInit {
  @Input() fg: FormGroup;
  @Input() vm: any;


  userCurrent: any;
  isUserCurrent: boolean;
  notifyStaff: MenuItem[];

  private _subscription: Subscription[] = [];

  constructor(private _apollo: Apollo, private userService: UserService) {  }

  ngOnInit() {
    const that = this;
    that._refreshUser();
  }

  addUser(target?, name?) {

    if (target === undefined  || name === '' || name === undefined || name === null) {
      const usersControls = this.vm.fg.get('users').controls;
      for (let i = this.vm.users.length; i >= 0; i--) {
          this.vm.users.splice(i, 1);
          usersControls.splice(i, 1);
      }

      this.isUserCurrent = true;
      this.userCurrent = this.userService.user._id;
      this.vm.users.push(new FormGroup({
        'id': new FormControl(this.userCurrent),
        'push': new FormControl(true),
        'email': new FormControl(false),
      }) as any);

    } else if (target !== undefined && this.vm.users.length === 0) {
      const users = target[0].notificationConfig.users;
      users.forEach(element => {
        this.isUserCurrent = false;
        let email =  false;
        let push =  false;
        element.deliveryMethod.forEach(deliveryMethod => {
           if (deliveryMethod === 'email') {
            email = true ;
           }
           if (deliveryMethod === 'push') {
            push = true ;
           }
        });
        this.vm.users.push(new FormGroup({
          'id': new FormControl(element.id),
          'push': new FormControl(push),
          'email': new FormControl(email),
        }) as any);
      });
    }
  }

  private add () {
      this.isUserCurrent = false;
      this.vm.users.push(new FormGroup({}) as any);
  }

  private removeUser(item?: FormGroup) {
    const usersControls = this.vm.fg.get('users') as FormArray;

    let filterIndex: any ;
    filterIndex = usersControls.controls.findIndex(c => c === item) ;
    if (filterIndex > -1 ) {
      (this.vm.fg.get('users') as FormArray).removeAt(filterIndex);
    }
  }

  private _refreshUser() {
    this._getAllUsers();
  }

  private _getAllUsers(): void {
    const that = this;

    this._subscription.push(this._apollo.watchQuery({
      query: userApi.all,
      fetchPolicy: 'network-only'
    })
    .valueChanges.subscribe(({data}) => {

      that.notifyStaff = (<any>data).allUsers.map((v, k) => {
        return {
          id: v._id,
          title: v.profile.firstName + ' ' + v.profile.lastName
        };
      });
    }));
  }


}

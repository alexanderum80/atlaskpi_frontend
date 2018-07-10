import { CommonService } from '../../../shared/services/common.service';
import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client/core/types';
import { Observable } from 'rxjs/Observable';

import { permissionsApi, roleSharedApi } from '../graphqlActions/roles-shared.actions';
import { RoleModel } from '../models/role.model';
import { IRoleRemoveResponse } from '../role';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class RolesService implements OnDestroy {
  permissions: any[];
  roles: any[];
  permissionsValid: boolean;
  existDuplicatedName: boolean;

  private model: RoleModel;
  private _subscription: Subscription[] = [];

  constructor(private _apollo: Apollo) {
  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  getPermissions(): Promise<ApolloQueryResult<any>> {
    return this._apollo.query({
      query: permissionsApi.all
    }).toPromise();
  }

  updatePermissionsList(data: any): any[] {
      const arr = [];
      for (const i in data) {
          if (i !== 'name') {
              if (data[i] === true) {
                  arr.push(i);
              }
          }
      }
      return arr;
  }

  deleteRole(id: string): Observable<ApolloQueryResult<IRoleRemoveResponse>> {
      return this._apollo.mutate({
        mutation: roleSharedApi.delete,
        variables: {
          id: id
        },
        updateQueries: {
          Roles: (previousResult, { mutationResult }) => {
            if ((<any>mutationResult).data.removeRole.success) {
              const currentRoles = (<any>previousResult).findAllRoles.filter(u => u._id !== id);
              return {
                findAllRoles: currentRoles
              };
            }
          }
        }
      }) as any;
  }

  watchChanges(fg: FormGroup): void {
    const that = this;
    this._subscription.push(
      fg.valueChanges
      .debounceTime(200)
      .distinctUntilChanged()
      .subscribe(permissionInfo => {
        const watchPermissionInfo = {
          permissions: that.updatePermissionsList(permissionInfo)
        };

        that.permissionsValid = watchPermissionInfo.permissions.length ? true : false;
      }));
  }

  isFormValid(fg: FormGroup): boolean {
    return fg.valid && this.permissionsValid;
  }

  updateExistDuplicatedName(value: boolean) {
    this.existDuplicatedName = value;
  }

  getExistDuplicatedName() {
    return this.existDuplicatedName;
  }

}

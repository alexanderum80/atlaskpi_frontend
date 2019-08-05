import { Apollo } from 'apollo-angular';
import { ICommentPayload } from './../../../shared/models/comments';
import { UserService } from './../../../shared/services/user.service';
import { IComment } from '../../../shared/models/comments';
import { IUserInfo } from '../../../shared/models/user';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import SweetAlert from 'sweetalert2';

const notifyComment = require('graphql-tag/loader!../graphql/notify-comment.mutation.gql');

@Injectable()
export class CommentsService {

  private _showUsersSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private _userSelectedSubject: BehaviorSubject<IUserInfo> = new BehaviorSubject<IUserInfo>(null);
  private _allUsers: IUserInfo[];
  private _currentUser: IUserInfo;
  private _chartSelected: string;

  constructor(private _userSvc: UserService, private _apollo: Apollo) {
   }

    viewCommentPermission() {
      return this._userSvc.hasPermission('View', 'Comment');
    }

    createCommentPermission() {
      return this._userSvc.hasPermission('Create', 'Comment');
    }

    updateCommentPermission() {
      return this._userSvc.hasPermission('Update', 'Comment');
    }

    deleteCommentPermission() {
      return this._userSvc.hasPermission('Delete', 'Comment');
    }

   get chartSelected() {
     return this._chartSelected;
   }

   set chartSelected(chartId: string) {
     this._chartSelected = chartId;
   }

  get allUsers() {
    return this._allUsers;
  }

  set allUsers(users: IUserInfo[]) {
    this._allUsers = users;
  }

  get currentUser() {
    return this._currentUser;
  }

  set currentUser(user: IUserInfo) {
    this._currentUser = user;
  }

  showUsers(chartId: string, show) {
    this._showUsersSubject.next({
      chartId: chartId,
      show: show
    });
  }

  hideUsers(chartId: string) {
    this._showUsersSubject.next({
      chartId: chartId,
      show: false
    });
  }

  get showUsers$(): Observable<Boolean> {
    return this._showUsersSubject.asObservable();
  }

  set userSelected(user: IUserInfo) {
    this._userSelectedSubject.next(user);
  }

  get userSelected$(): Observable<IUserInfo> {
    return this._userSelectedSubject.asObservable();
  }

  sendCommentNotification(commentPayload: ICommentPayload[], dashBoardId: string): boolean {
    const result = [];
    const commentfrom = JSON.stringify(this._currentUser);
    commentPayload.map(p => {
      p.users.map(u => {
        const targetUser = this._allUsers.find(cu => cu._id === u.id);
        const commentto = JSON.stringify(targetUser);
        this._apollo.mutate<any>({
          mutation: notifyComment,
          variables: { from: commentfrom, to: commentto,  dashboardId: dashBoardId }
          })
          .toPromise()
          .then(res => {
            if (res.data.commentNotify === null) {
              result.push(false);
            } else {
              result.push(true);
            }
          })
          .catch(err => {
            SweetAlert({
              title: 'Notification error!',
              text: 'An error has ocurred while sending emails to notify the users.',
              type: 'error'
            }).then(done => {
              result.push(false);
            });
          });
        });
      });
      return result.findIndex(r => r === false) === -1;
  }

}

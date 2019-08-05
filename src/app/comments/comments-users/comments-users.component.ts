import { IUserInfo } from './../../shared/models/user';
import { UserService } from './../../shared/services/user.service';
import { Component, OnInit, Input } from '@angular/core';
import { ApolloService } from '../../shared/services/apollo.service';
import { CommentsService } from '../shared/services/comments.service';

@Component({
  selector: 'kpi-comments-users',
  templateUrl: './comments-users.component.pug',
  styleUrls: ['./comments-users.component.scss']
})
export class CommentsUsersComponent implements OnInit {

  @Input() chartId: string;

  users: IUserInfo[];

  constructor(private _commentsSvc: CommentsService) { }

  ngOnInit() {
    this.users = this._commentsSvc.allUsers.filter(u => u._id !== this._commentsSvc.currentUser._id);
  }

  onUserSelected(user) {
    this._commentsSvc.chartSelected = this.chartId;
    this._commentsSvc.userSelected = user;
    this._commentsSvc.hideUsers(this.chartId);
  }
}

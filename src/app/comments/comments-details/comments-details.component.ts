import { ChartViewComponent } from './../../charts/chart-view/chart-view.component';
import { Apollo } from 'apollo-angular';
import { CommentsService } from '../shared/services/comments.service';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { IComment } from '../../shared/models/comments';
import { formatMessage } from '../shared/ui/common';
import SweetAlert from 'sweetalert2';
import { Subscription } from 'rxjs/Subscription';

const markCommentDeleted = require('graphql-tag/loader!../shared/graphql/mark-comment-deleted.mutation.gql');
const markCommentChildrenDeleted = require('graphql-tag/loader!../shared/graphql/mark-comment-children-deleted.mutation.gql');

@Component({
  selector: 'kpi-comments-details',
  templateUrl: './comments-details.component.pug',
  styleUrls: ['./comments-details.component.scss']
})
export class CommentsDetailsComponent implements OnInit {
  @ViewChild(ChartViewComponent) chartView: ChartViewComponent;
  @Input() parent: IComment;
  @Input() comment: IComment;
  @Output() replyComment = new EventEmitter<any>();
  @Output() refreshComments = new EventEmitter<boolean>();

  subscriptions: Subscription[] = [];
  pictureurl = '';
  isChildrenComment = false;
  firstName = '';
  lastName = '';

  constructor(private _apollo: Apollo, private _commentsSvc: CommentsService) { }

  ngOnInit() {
    if (this.comment) { this.comment.formattedMessage = formatMessage(this.comment.message); }
    const user = this._commentsSvc.allUsers.find(u => u._id === this.comment.createdBy);
    if (user) {
      this.firstName = user.profile.firstName;
      this.lastName = user.profile.lastName;
      this.pictureurl = user.profilePictureUrl ? user.profilePictureUrl
      : '/assets/img/users/users.png';
    }
    this.isChildrenComment = this.parent !== undefined;
  }

  isRead() {
    const index = this.comment.users.findIndex(u => u.id === this._commentsSvc.currentUser._id);
    return this.comment.createdBy === this._commentsSvc.currentUser._id
    || (index !== -1 && this.comment.users[index].read === true)
    || this.comment.users.length === 1 && this.comment.users[0].id === this.comment.createdBy;
  }

  onReplyComment() {
    if (this.isChildrenComment) {
      this.replyComment.emit({
        replychildren: true,
        parent: this.parent,
        comment: this.comment
      });
    } else {
      this.replyComment.emit({
        replychildren: false,
        parent: null,
        comment: this.comment
      });
    }
  }

  canRemove() {
    const roles = this._commentsSvc.currentUser.roles.map(r => r.name).join(',');
    return this.comment.createdBy === this._commentsSvc.currentUser._id
    || roles.includes('owner') || roles.includes('admin');
  }

  onDeleteComment() {
    SweetAlert({
      type: 'warning',
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to view this comment',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    }).then(result => {
      if (result.value === true) {
        if (this.isChildrenComment) {
          this.deleteChildren();
        } else {
          this.deleteComment();
        }
      }
    });
  }

  deleteComment() {
      this._apollo.mutate({
          mutation: markCommentDeleted,
          variables: { id: this.comment._id }
      }).toPromise()
      .then(() => {
        this.refreshComments.emit(true);
      })
      .catch(err => console.log(err));
  }

  deleteChildren() {
    this._apollo.mutate({
      mutation: markCommentChildrenDeleted,
      variables: { id: this.parent._id, children: this.comment._id }
      })
      .toPromise()
      .then(() => {
        this.refreshComments.emit(true);
      })
      .catch(err => console.log(err));
  }

  ComputeTimeAgo(comment) {
    return moment(comment.createdDate).fromNow();
  }

  get imgwith() {
    if (this.isChildrenComment) { return 30; } else { return 40; }
  }

}

import { IComment, ICommentPayload } from './../../shared/models/comments';
import * as moment from 'moment';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ViewChild } from '@angular/core';
import { Apollo } from 'apollo-angular';
import SweetAlert from 'sweetalert2';
import { CommentsService } from '../shared/services/comments.service';
import { CommentNewComponent } from '../comment-new/comment-new.component';
import { Router } from '@angular/router';

const createComment = require('graphql-tag/loader!../shared/graphql/create-comment.mutation.gql');
const markCommentRead = require('graphql-tag/loader!../shared/graphql/mark-comment-read.mutation.gql');
const notifyComment = require('graphql-tag/loader!../shared/graphql/notify-comment.mutation.gql');

@Component({
  selector: 'kpi-comments-forum',
  templateUrl: './comments-forum.component.pug',
  styleUrls: ['./comments-forum.component.scss']
})
export class CommentsForumComponent implements OnInit, OnChanges {
  @ViewChild(CommentNewComponent) commentNew: CommentNewComponent;


  @Input() dashBoardId: string;
  @Input() chartId: string;
  @Input() comments: IComment[];
  @Input() chartMaximized = false;
  @Output() close = new EventEmitter<boolean>();
  @Output() refreshComments = new EventEmitter<boolean>();

  emailUsers: string[] = [];
  hasComments = false;
  newComments: IComment[] = [];
  commentToReply: IComment;
  replyInProgress = false;
  isCollapsed = true;

  constructor(private _apollo: Apollo, private _commentsSvc: CommentsService,
    private _router: Router) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.hasComments = this.comments.length > 0;
  }

  ismoreThanOneChildren(comment: IComment) {
    if (!comment || !comment.children) { return false; }
    return comment.children.filter(c => c.deleted === false).length > 1;
  }

  onRefreshComments() {
    this.refreshComments.emit(true);
  }

  onCommentReplyClose() {
    this.replyInProgress = false;
  }

  replyThisComment(comment) {
    this.commentToReply = comment;
    this.replyInProgress = true;
  }

  getCardStyle() {
    return {
        'height': '400px !important',
    };
  }

  closeComment() {
    const commentsReaded = this.comments.map(c => c._id);
    this._apollo.mutate<any>({
      mutation: markCommentRead,
      variables: { id: commentsReaded.join(','), user: this._commentsSvc.currentUser._id }
      })
      .toPromise()
      .then(res => {
        this.refreshComments.emit(true);
        this._commentsSvc.showUsers(this.chartId, false);
        this.commentNew.newComments = [];
        this.commentNew.fgPatchValues('');
        this.close.emit(true);
      })
      .catch(err => console.log(err));
  }

  validComments(): boolean {
    return this.commentNew
    && this._commentsSvc.createCommentPermission()
    && this.validCurrentComment();
  }
  validCurrentComment(): boolean {
    return this.commentNew &&
    ((this.commentNew.fgValue !== '' && this.commentNew.targetUser
    && this.commentNew.targetUser.length > 0)
    || (this.commentNew.fgValue === '' && this.commentNew.newComments.length > 0));
  }

  saveAndSendNotification() {
    if (!this.commentNew) { return; }
    const commentPayload: ICommentPayload[] = [];
    let msg;
    if (this.hasComments) {
      msg = this.commentNew.getmsg();
      commentPayload.push({
        chart: msg.chart,
        users: msg.users.map(u => {
          return {id: u.id, read: false};
        }),
        message: msg.message,
        deleted: false,
        children: [],
        createdBy: this._commentsSvc.currentUser._id,
        createdDate: moment().toDate()
      });
    } else {
      if (this.commentNew.fgValue !== '') {
        const commentTmp = this.commentNew.getmsg();
        this.commentNew.newComments.push(commentTmp);
      }
      this.commentNew.newComments.map(n => {
        if (n._id === undefined) {
          commentPayload.push({
            chart: n.chart,
            users: n.users.map(u => {
              return {id: u.id, read: false};
            }),
            message: n.message,
            deleted: false,
            children: [],
            createdBy: this._commentsSvc.currentUser._id,
            createdDate: moment().toDate()
          });
        }
      });
    }

  this._commentsSvc.sendCommentNotification(commentPayload, this.dashBoardId);

  if (commentPayload.length === 0) { return; }
  this.commentNew.targetUser = [];
  this.commentNew.newComments = [];
  this._apollo.mutate<any>({
    mutation: createComment,
    variables: { input: commentPayload }
    })
    .toPromise()
    .then(response => {
        if (response.data.createComment.errors === null) {
          this.refreshComments.emit(true);
          this.close.emit(true);
          SweetAlert({
            title: 'Done!',
            text: 'Your comments has been saved & the users have been notified.',
            type: 'info'
          })
        }
        if (response.data.createComment.errors) {
            // perform an error message
            console.log(response.data.createComment.errors);
        }
        if (this.hasComments) {
          this.commentNew.fgPatchValues('');
        } else {
          this.commentNew.newComments = [];
          this.commentNew.targetUser = [];
        }
    })
    .catch(err => {
      console.log(err);
    });
  }
}

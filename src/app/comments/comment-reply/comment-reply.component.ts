import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { CommentsService } from '../shared/services/comments.service';
import { UserService } from '../../shared/services/user.service';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IUserInfo } from '../../shared/models';
import * as moment from 'moment';
import { ICommentPayload } from 'src/app/shared/models/comments';

const addChildrenComment = require('graphql-tag/loader!../shared/graphql/addChildren-comment.query.gql');

@Component({
  selector: 'kpi-comment-reply',
  templateUrl: './comment-reply.component.pug',
  styleUrls: ['./comment-reply.component.scss']
})
export class CommentReplyComponent implements OnInit {

  @Input() commentToReply: any;
  @Input() dashBoardId: string;
  @Output() close = new EventEmitter<Boolean>();
  @Output() refreshComments = new EventEmitter<boolean>();

  fg: FormGroup = new FormGroup({});
  currentUser: IUserInfo;

  constructor( private _userSvc: UserService,
    private _router: Router,
    private _apollo: Apollo,
    private _commentsSvc: CommentsService) { }

  ngOnInit() {
    this.fgPatchValues('');
    this._userSvc.user$.subscribe(currentUser => {
      this.currentUser = currentUser;
    });
  }

  private fgPatchValues(value) {
    const fgValues = {
      newComment: value
    };
    this.fg.patchValue(fgValues);
  }

  get fgValue() {
    return this.fg.controls['newComment'].value;
  }

  closeComment() {
    this.fgPatchValues('');
    this.close.emit(true);
  }

  validComment(): boolean {
    return this.fg && this.fgValue && this.fgValue !== ''
    && this._commentsSvc.updateCommentPermission();
  }

  saveChildComment() {
    if (!this._commentsSvc.updateCommentPermission()) {
      this._router.navigateByUrl('/unauthorized');
    }
    const user = this._commentsSvc.allUsers.find(u => u._id === this.commentToReply.comment.createdBy);
    const targetUser = user.profile.firstName
    + '.' + user.profile.lastName;
    const replytoSave = {
      users: [
        {
          id: user._id,
          read: false
        }
      ],
      message: this.fgValue + ' @' + targetUser,
      deleted: false,
      createdBy: this._commentsSvc.currentUser._id,
      createdDate: moment().toDate()
    };

    const commentPayload: ICommentPayload[] = [];

    commentPayload.push({
      chart: '',
      users: replytoSave.users.map(u => {
        return {id: u.id, read: false};
      }),
      message: '',
      deleted: false,
      children: [],
      createdBy: this._commentsSvc.currentUser._id,
      createdDate: moment().toDate()
    });

    this._commentsSvc.sendCommentNotification(commentPayload, this.dashBoardId);
    const idToReply = this.commentToReply.parent ? this.commentToReply.parent._id : this.commentToReply.comment._id;
    this._apollo.query<any>({
      query: addChildrenComment,
      variables: { id: idToReply  , input: replytoSave }
    })
    .toPromise()
    .then(() => {
        this.refreshComments.emit(true);
        this.fgPatchValues('');
        this.close.emit();
    });
  }

}


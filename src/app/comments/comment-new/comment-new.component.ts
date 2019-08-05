import { CommentsService } from '../shared/services/comments.service';
import { IComment } from './../../shared/models/comments';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as moment from 'moment';
import SweetAlert from 'sweetalert2';
import { formatMessage } from '../shared/ui/common';

@Component({
  selector: 'kpi-comment-new',
  templateUrl: './comment-new.component.pug',
  styleUrls: ['./comment-new.component.scss']
})
export class CommentNewComponent implements OnInit, OnChanges {

  @Input() chartId: string;
  @Input() comments: IComment[];
  @Input() chartMaximized = false;

  hasComments = false;
  fg: FormGroup = new FormGroup({});
  newComments: IComment[] = [];
  targetUser: string[] = [];
  title = '';

  constructor(private _commentsSvc: CommentsService) { }

  ngOnInit() {

    this.fgPatchValues('');
    this._commentsSvc.userSelected$.subscribe(user => {
      if (!user) { return; }
      this.targetUser.push(user._id);
      this._commentsSvc.userSelected = null;
      if (this._commentsSvc.chartSelected === this.chartId) {
        this.fgPatchValues(this.fgValue +  user.profile.firstName + '.' + user.profile.lastName);
      }
    });
    this._subscribeToFormChange();
  }
  ngOnChanges() {
    this.hasComments = this.comments.length > 0;
      this.title = this.hasComments ? 'Add a comment on this chart'
      : 'Add a comment to this chart';
  }

  fgPatchValues(value) {
    const fgValues = {
      newComment: value
    };
    this.fg.patchValue(fgValues);
  }

  public get fgValue() {
    return this.fg && this.fg.controls['newComment'] ? this.fg.controls['newComment'].value : '';
  }

  private _subscribeToFormChange() {
    this.fg.valueChanges.subscribe(value => {
      if (!value.newComment) { return; }
      if (value.newComment[value.newComment.length - 1] === '@') {
        // Show user's list
        this._commentsSvc.showUsers(this.chartId, true);
      }
    });
  }

  editMessage(index) {
    this.fg.patchValue({ newComment: this.newComments[index].message });
    this.targetUser = [];
    this.newComments[index].users.map(u => {
      this.targetUser.push(u.id);
    });
    this.newComments.splice(index, 1);
  }

  checkKey(event) {
    if (this.hasComments) { return; }
    if (event.keyCode === 13) {
      if ((!this.hasComments && this.targetUser.length === 0)) {
        SweetAlert({
          title: 'Error!!',
          text: 'You must select targets users by typing @, to notify them in yours emails.',
          type: 'error',
          showConfirmButton: true,
          confirmButtonText: 'Ok'
        });
        return;
      }
      const msg = this.getmsg();
      this.newComments.push(msg);
      this.fgPatchValues('');
      this.targetUser = [];
    }
  }

  getmsg() {
    const customMessage = formatMessage(this.fgValue);
    return {
      _id: undefined,
      chart: this.chartId,
      users: this.targetUser.map(t => {
        return { id: t, read: false };
      }),

      message: this.fgValue,
      formattedMessage: customMessage,
      deleted: false,
      children: [],
      createdBy: this._commentsSvc.currentUser._id,
      createdDate: moment().toDate()
    };
  }
}

import { SharedModule } from './../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { MaterialFormsModule } from './../ng-material-components/modules/forms/material-forms.module';
import { MaterialUserInterfaceModule } from './../ng-material-components/modules/user-interface/material-user-interface.module';
import { CommentNewComponent } from './comment-new/comment-new.component';
import { CommentsUsersComponent } from './comments-users/comments-users.component';
import { CommentsForumComponent } from './comments-forum/comments-forum.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommentsDetailsComponent } from './comments-details/comments-details.component';
import { CommentsService } from './shared/services/comments.service';
import { CommentReplyComponent } from './comment-reply/comment-reply.component';

@NgModule({
    imports: [
        CommonModule,
        MaterialUserInterfaceModule,
        MaterialFormsModule,
        FormsModule,
        SharedModule
    ],
    declarations: [
        CommentsUsersComponent,
        CommentsForumComponent,
        CommentNewComponent,
        CommentsDetailsComponent,
        CommentReplyComponent
    ],
    exports: [
        CommentsUsersComponent,
        CommentsForumComponent,
        CommentNewComponent
    ],
    providers: [CommentsService]
})
export class CommentsModule {}

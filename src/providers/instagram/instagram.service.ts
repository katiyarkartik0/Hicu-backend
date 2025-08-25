import { Injectable, Logger } from '@nestjs/common';
import { PrivateInfoService } from './serviceBundle/privateInfo.service';
import { DmService } from './serviceBundle/dm.service';
import { PostService } from './serviceBundle/post.service';
import { CommentService } from './serviceBundle/comment.service';

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  respondToComment: CommentService['respondToComment'];
  getCommentsByPostId: CommentService['getCommentsByPostId'];
  saveComment: CommentService['save'];

  getConversationHistory: DmService['getConversationHistory'];
  sendDM: DmService['sendDM'];
  sendDmForExistingConversation: DmService['sendDmForExistingConversation'];
  sendImageInDm: DmService['sendImageInDm'];

  getAllSavedPosts: PostService['getAllSavedPosts'];
  getPostInfoByReplyId: PostService['getPostInfoByReplyId'];
  getPostInfoByMediaId: PostService['getPostInfoByMediaId'];
  syncPosts: PostService['syncPosts'];

  getInstagramAccessToken: PrivateInfoService['getInstagramAccessToken'];
  getMyDetails: PrivateInfoService['getMyDetails'];
  syncProfile: PrivateInfoService['syncProfile'];

  constructor(
    private readonly commentService: CommentService,
    private readonly dmService: DmService,
    private readonly privateInfoService: PrivateInfoService,
    private readonly postService: PostService,
  ) {
    // CommentService bindings
    this.saveComment = this.commentService.save.bind(this.commentService);
    this.respondToComment = this.commentService.respondToComment.bind(
      this.commentService,
    );
    this.getCommentsByPostId = this.commentService.getCommentsByPostId.bind(
      this.commentService,
    );

    // DmService bindings
    this.getConversationHistory = this.dmService.getConversationHistory.bind(
      this.dmService,
    );
    this.sendDM = this.dmService.sendDM.bind(this.dmService);
    this.sendDmForExistingConversation =
      this.dmService.sendDmForExistingConversation.bind(this.dmService);
    this.sendImageInDm = this.dmService.sendImageInDm.bind(this.dmService);

    // PostService bindings
    this.getAllSavedPosts = this.postService.getAllSavedPosts.bind(
      this.postService,
    );
    this.getPostInfoByReplyId = this.postService.getPostInfoByReplyId.bind(
      this.postService,
    );
    this.getPostInfoByMediaId = this.postService.getPostInfoByMediaId.bind(
      this.postService,
    );
    this.syncPosts = this.postService.syncPosts.bind(this.postService);

    // PrivateInfoService bindings
    this.getInstagramAccessToken =
      this.privateInfoService.getInstagramAccessToken.bind(
        this.privateInfoService,
      );
    this.getMyDetails = this.privateInfoService.getMyDetails.bind(
      this.privateInfoService,
    );
    this.syncProfile = this.privateInfoService.syncProfile.bind(
      this.privateInfoService,
    );
  }
}

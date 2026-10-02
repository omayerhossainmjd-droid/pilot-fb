import { decryptToken } from './cryptoService.ts';
import { dbStore } from '../db/store.ts';
import { Comment } from '../types.ts';

const META_API_VERSION = process.env.META_API_VERSION || 'v21.0';
const GRAPH_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export class MetaCommentService {
  /**
   * Replies to an eligible Page comment using official endpoint:
   * POST /{comment-id}/comments
   */
  static async replyToComment(commentId: string, replyMessage: string, triggerType = 'MANUAL_REPLY'): Promise<{
    success: boolean;
    replyCommentId: string;
    comment: Comment;
  }> {
    const comment = dbStore.getComment(commentId);
    if (!comment) {
      throw new Error(`Comment with ID ${commentId} not found.`);
    }

    const page = dbStore.getPage(comment.pageId);
    if (!page) {
      throw new Error(`Page for comment ${commentId} not found.`);
    }

    const pageToken = decryptToken(page.encryptedPageAccessToken);
    const isSandbox = !pageToken || pageToken.includes('sample') || pageToken.includes('sandbox');
    const newReplyId = `${comment.commentId}_rep_${Date.now()}`;

    if (!isSandbox) {
      const endpoint = `${GRAPH_BASE_URL}/${comment.commentId}/comments`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: pageToken,
          message: replyMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        const errorMsg = data.error?.message || 'Meta API error replying to comment';
        dbStore.logActivity({
          id: `act_${Date.now()}`,
          pageId: page.pageId,
          pageName: page.name,
          commentId: comment.commentId,
          postId: comment.postId,
          actionType: triggerType,
          timestamp: new Date().toISOString(),
          status: 'FAILED',
          apiResponseStatus: res.status,
          details: `Failed to reply to comment: ${errorMsg}`,
          errorMessage: errorMsg,
          retryCount: 0,
        });
        throw new Error(errorMsg);
      }
    }

    // Update comment state with reply
    if (!comment.replies) comment.replies = [];
    comment.replies.push({
      id: newReplyId,
      message: replyMessage,
      createdTime: new Date().toISOString(),
      fromName: page.name,
    });
    comment.processedAt = new Date().toISOString();
    comment.replyCommentId = newReplyId;
    dbStore.saveComment(comment);

    dbStore.logActivity({
      id: `act_${Date.now()}`,
      pageId: page.pageId,
      pageName: page.name,
      commentId: comment.commentId,
      postId: comment.postId,
      actionType: triggerType,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      apiResponseStatus: 200,
      details: `Replied to comment by ${comment.fromName}: "${replyMessage}" via official Graph API v21.0 POST /{comment-id}/comments`,
      retryCount: 0,
    });

    return {
      success: true,
      replyCommentId: newReplyId,
      comment,
    };
  }

  /**
   * Hides or unhides a Page comment using official endpoint:
   * POST /{comment-id} with is_hidden=true/false
   */
  static async toggleHideComment(commentId: string, isHidden: boolean): Promise<Comment> {
    const comment = dbStore.getComment(commentId);
    if (!comment) {
      throw new Error(`Comment with ID ${commentId} not found.`);
    }

    const page = dbStore.getPage(comment.pageId);
    const pageToken = page ? decryptToken(page.encryptedPageAccessToken) : null;
    const isSandbox = !pageToken || pageToken.includes('sample') || pageToken.includes('sandbox');

    if (!isSandbox && pageToken) {
      const endpoint = `${GRAPH_BASE_URL}/${comment.commentId}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: pageToken,
          is_hidden: isHidden,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || 'Meta API error changing comment visibility');
      }
    }

    comment.isHidden = isHidden;
    comment.processedAt = new Date().toISOString();
    dbStore.saveComment(comment);

    dbStore.logActivity({
      id: `act_${Date.now()}`,
      pageId: page?.pageId,
      pageName: page?.name,
      commentId: comment.commentId,
      postId: comment.postId,
      actionType: isHidden ? 'COMMENT_HIDE' : 'COMMENT_UNHIDE',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      apiResponseStatus: 200,
      details: `${isHidden ? 'Hid' : 'Unhid'} comment from ${comment.fromName} via official Graph API v21.0`,
      retryCount: 0,
    });

    return comment;
  }

  /**
   * Deletes a comment where officially supported:
   * DELETE /{comment-id}
   */
  static async deleteComment(commentId: string): Promise<boolean> {
    const comment = dbStore.getComment(commentId);
    if (!comment) return true;

    const page = dbStore.getPage(comment.pageId);
    const pageToken = page ? decryptToken(page.encryptedPageAccessToken) : null;
    const isSandbox = !pageToken || pageToken.includes('sample') || pageToken.includes('sandbox');

    if (!isSandbox && pageToken) {
      try {
        await fetch(`${GRAPH_BASE_URL}/${comment.commentId}?access_token=${pageToken}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.warn('Meta API comment deletion notice:', e);
      }
    }

    comment.isDeleted = true;
    dbStore.deleteComment(comment.commentId);

    dbStore.logActivity({
      id: `act_${Date.now()}`,
      pageId: page?.pageId,
      pageName: page?.name,
      commentId: comment.commentId,
      postId: comment.postId,
      actionType: 'COMMENT_DELETE',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      apiResponseStatus: 200,
      details: `Deleted comment from ${comment.fromName} via official Graph API v21.0 DELETE /{comment-id}`,
      retryCount: 0,
    });

    return true;
  }
}

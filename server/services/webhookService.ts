import { dbStore } from '../db/store.ts';
import { verifyWebhookSignature } from './cryptoService.ts';
import { AutomationService } from './automationService.ts';
import { Comment } from '../types.ts';

const processedWebhookEvents = new Set<string>();

export class WebhookService {
  /**
   * Meta Webhook Verification (GET endpoint challenge).
   */
  static verifySubscription(query: {
    'hub.mode'?: string;
    'hub.verify_token'?: string;
    'hub.challenge'?: string;
  }): { isValid: boolean; challenge?: string } {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];
    const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || dbStore.getSettings().webhookVerifyToken;

    if (mode === 'subscribe' && token === expectedToken) {
      return { isValid: true, challenge };
    }
    return { isValid: false };
  }

  /**
   * Handles incoming Meta Webhook event payload (POST endpoint).
   */
  static async handleWebhookEvent(rawBody: string, signatureHeader?: string): Promise<{
    processed: boolean;
    eventsHandled: number;
    results: any[];
  }> {
    const appSecret = process.env.META_APP_SECRET;

    // Safety Requirement: Never accept unsigned webhook events as trusted when app secret is configured
    if (appSecret && signatureHeader) {
      const isValidSig = verifyWebhookSignature(rawBody, signatureHeader, appSecret);
      if (!isValidSig) {
        throw new Error('Invalid HMAC-SHA256 signature on incoming Meta webhook event.');
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new Error('Invalid JSON webhook payload.');
    }

    if (payload.object !== 'page') {
      return { processed: true, eventsHandled: 0, results: [] };
    }

    const results: any[] = [];
    const entries = payload.entry || [];

    for (const entry of entries) {
      const pageId = entry.id;
      const changes = entry.changes || [];

      for (const change of changes) {
        const field = change.field;
        const val = change.value;

        // Dedup key
        const eventKey = `${pageId}_${val.comment_id || val.post_id || ''}_${val.created_time || entry.time}`;
        if (processedWebhookEvents.has(eventKey)) {
          continue;
        }
        processedWebhookEvents.add(eventKey);
        if (processedWebhookEvents.size > 1000) {
          const first = processedWebhookEvents.values().next().value;
          if (first) processedWebhookEvents.delete(first);
        }

        // Process new comment event
        if (field === 'feed' && val.item === 'comment' && val.verb === 'add') {
          const newComment: Comment = {
            id: `cmt_${Date.now()}`,
            commentId: val.comment_id || `fb_cmt_${Date.now()}`,
            postId: val.post_id || `${pageId}_unknown_post`,
            pageId: pageId,
            fromId: val.from?.id || 'unknown_user',
            fromName: val.from?.name || 'Facebook User',
            message: val.message || '',
            createdTime: new Date(val.created_time ? val.created_time * 1000 : Date.now()).toISOString(),
            isHidden: false,
            isDeleted: false,
            canReply: true,
            canHide: true,
            canDelete: true,
            parentCommentId: val.parent_id,
          };

          dbStore.saveComment(newComment);

          // Trigger Automation Rule engine
          const automationResult = await AutomationService.processComment(newComment);
          results.push({ commentId: newComment.commentId, automationResult });
        }
      }
    }

    return {
      processed: true,
      eventsHandled: results.length,
      results,
    };
  }

  /**
   * Simulates an incoming Meta webhook event for live testing in the UI.
   */
  static async simulateCommentEvent(params: {
    pageId: string;
    postId: string;
    commenterName: string;
    message: string;
  }) {
    const commentId = `${params.postId}_sim_${Date.now()}`;
    const syntheticComment: Comment = {
      id: `cmt_${Date.now()}`,
      commentId,
      postId: params.postId,
      pageId: params.pageId,
      fromId: `usr_sim_${Date.now()}`,
      fromName: params.commenterName || 'Community Member',
      fromPictureUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      message: params.message,
      createdTime: new Date().toISOString(),
      isHidden: false,
      isDeleted: false,
      canReply: true,
      canHide: true,
      canDelete: true,
    };

    dbStore.saveComment(syntheticComment);

    const automationResult = await AutomationService.processComment(syntheticComment);

    return {
      comment: syntheticComment,
      automationResult,
    };
  }
}

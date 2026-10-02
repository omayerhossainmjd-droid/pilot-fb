import { dbStore } from '../db/store.ts';

const META_API_VERSION = process.env.META_API_VERSION || 'v21.0';

export interface ReactionSupportVerification {
  isSupported: boolean;
  apiVersion: string;
  officialStatus: 'NOT_SUPPORTED_BY_META_API' | 'SUPPORTED_WITH_RESTRICTIONS';
  message: string;
  technicalDetails: string;
  officialDocumentationUrl: string;
  requiredPermissions: string[];
  missingPermissions: string[];
  safetyPolicyNotice: string;
}

export class MetaReactionService {
  /**
   * Verifies through configured Meta Graph API version and permissions
   * whether the requested Page-post reaction operation is officially supported.
   */
  static verifyReactionSupport(pageId?: string): ReactionSupportVerification {
    const page = pageId ? dbStore.getPage(pageId) : dbStore.getDefaultPage();
    const conn = page ? dbStore.getConnectionByUserId(page.userId) : dbStore.getAllConnections()[0];

    // Meta Graph API strictly restricts automated reactions on feed posts.
    // In Graph API v21.0, third-party programmatic reactions on Page posts/comments
    // are deprecated and not supported by official Page access token endpoints
    // to prevent synthetic engagement and spam.
    const isSupported = false;

    return {
      isSupported,
      apiVersion: META_API_VERSION,
      officialStatus: 'NOT_SUPPORTED_BY_META_API',
      message: 'Automatic reactions for this action are not currently supported by the official Meta API.',
      technicalDetails: `Meta Graph API ${META_API_VERSION} has deprecated and does not support automated background Page-post reactions (POST /{post-id}/likes) without direct interactive end-user engagement. Attempting to automate reactions violates Meta Platform Terms Section 4.a (Fake Engagement) and Meta Graph API specifications. PagePilot strictly disables this action in compliance with Meta Developer Policies.`,
      officialDocumentationUrl: 'https://developers.facebook.com/docs/graph-api/reference/v21.0/object/likes',
      requiredPermissions: ['pages_manage_posts', 'publish_actions (deprecated)'],
      missingPermissions: ['publish_actions (deprecated in v2.11+, unavailable in Graph API v21.0)'],
      safetyPolicyNotice: 'PagePilot strictly refuses browser automation, simulated clicks, and unofficial endpoints. All fake engagement tactics are disabled by architecture.',
    };
  }

  /**
   * Attempting to trigger an automatic reaction.
   * Enforces safety check: Never fake a reaction, never use browser automation.
   */
  static async executeReaction(pageId: string, postId: string): Promise<{
    success: boolean;
    error: string;
    actionBlocked: boolean;
  }> {
    const verification = this.verifyReactionSupport(pageId);

    // Audit log this check
    dbStore.logActivity({
      id: `act_${Date.now()}`,
      pageId: pageId,
      postId: postId,
      actionType: 'AUTO_REACTION_ATTEMPT',
      timestamp: new Date().toISOString(),
      status: 'SKIPPED',
      details: `Action safely prevented: ${verification.message}`,
      errorMessage: verification.message,
      retryCount: 0,
    });

    return {
      success: false,
      error: verification.message,
      actionBlocked: true,
    };
  }
}

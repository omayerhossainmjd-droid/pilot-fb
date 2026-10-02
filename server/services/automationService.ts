import { dbStore } from '../db/store.ts';
import { Comment, AutomationRule, ModerationRule } from '../types.ts';
import { MetaCommentService } from './metaCommentService.ts';

// In-memory execution rate counters: [ruleId]: timestamp[]
const executionTimestamps: Record<string, number[]> = {};
// User/Post cooldowns: [pageId_postId_fromId]: lastTimestamp
const cooldownMap: Record<string, number> = {};

export class AutomationService {
  /**
   * Main entrypoint: Processes an incoming or new comment through moderation & automation rules.
   */
  static async processComment(comment: Comment): Promise<{
    moderated: boolean;
    moderationAction?: string;
    automatedReply: boolean;
    ruleId?: string;
    details?: string;
  }> {
    const pageId = comment.pageId;
    const commentText = comment.message || '';

    // Step 1: Run Moderation Rules First (e.g. spam / blocklists)
    const moderationRules = dbStore.getModerationRules(pageId).filter((r) => r.isEnabled);
    for (const modRule of moderationRules) {
      const isBlocked = this.checkModerationMatch(commentText, modRule);
      if (isBlocked) {
        if (modRule.action === 'HIDE') {
          await MetaCommentService.toggleHideComment(comment.commentId, true);
          return {
            moderated: true,
            moderationAction: 'COMMENT_HIDDEN_BY_RULE',
            automatedReply: false,
            details: `Comment contained blocked keyword matching moderation rule "${modRule.name}"`,
          };
        }
      }
    }

    // Step 2: Duplicate Reply Protection
    if (comment.replyCommentId || (comment.replies && comment.replies.length > 0)) {
      return {
        moderated: false,
        automatedReply: false,
        details: 'Skipped: Comment has already been replied to.',
      };
    }

    // Step 3: Run Automation Rules
    const activeRules = dbStore.getRules(pageId).filter((r) => r.isEnabled);
    const settings = dbStore.getSettings();

    for (const rule of activeRules) {
      const isMatch = this.evaluateCondition(commentText, rule);
      if (!isMatch) continue;

      // Rate limit check: Maximum executions per hour
      const maxPerHour = rule.maxExecutionsPerHour || settings.maxRepliesPerHour || 30;
      const now = Date.now();
      const oneHourAgo = now - 3600 * 1000;

      if (!executionTimestamps[rule.id]) {
        executionTimestamps[rule.id] = [];
      }
      executionTimestamps[rule.id] = executionTimestamps[rule.id].filter((t) => t > oneHourAgo);

      if (executionTimestamps[rule.id].length >= maxPerHour) {
        dbStore.saveExecution({
          id: `exec_${Date.now()}`,
          ruleId: rule.id,
          ruleName: rule.name,
          pageId: pageId,
          postId: comment.postId,
          commentId: comment.commentId,
          commentText: comment.message,
          actionTaken: 'RATE_LIMIT_EXCEEDED',
          status: 'SKIPPED',
          reason: `Hourly rate limit of ${maxPerHour} executions reached.`,
          executionTimeMs: 4,
          createdAt: new Date().toISOString(),
        });
        continue;
      }

      // Cooldown check (per commenter / post)
      const cooldownKey = `${pageId}_${comment.postId}_${comment.fromId}`;
      const lastExec = cooldownMap[cooldownKey] || 0;
      const cooldownMs = (rule.cooldownSeconds || settings.defaultCooldownSeconds || 60) * 1000;

      if (now - lastExec < cooldownMs) {
        dbStore.saveExecution({
          id: `exec_${Date.now()}`,
          ruleId: rule.id,
          ruleName: rule.name,
          pageId: pageId,
          postId: comment.postId,
          commentId: comment.commentId,
          commentText: comment.message,
          actionTaken: 'COOLDOWN_ACTIVE',
          status: 'SKIPPED',
          reason: `Cooldown active for user ${comment.fromName || comment.fromId} (${Math.round((cooldownMs - (now - lastExec)) / 1000)}s remaining)`,
          executionTimeMs: 2,
          createdAt: new Date().toISOString(),
        });
        continue;
      }

      // Select Reply Content
      let replyContent = rule.actions.replyText;
      if (rule.actions.replyTemplateId) {
        const tmpl = dbStore.getTemplate(rule.actions.replyTemplateId);
        if (tmpl) {
          replyContent = tmpl.replyText;
          tmpl.executionCount = (tmpl.executionCount || 0) + 1;
          dbStore.saveTemplate(tmpl);
        }
      }

      if (!replyContent) {
        continue;
      }

      const startTime = Date.now();
      try {
        // Execute reply via official MetaCommentService
        const replyResult = await MetaCommentService.replyToComment(
          comment.commentId,
          replyContent,
          'AUTO_REPLY_RULE'
        );

        // Update timestamps
        executionTimestamps[rule.id].push(now);
        cooldownMap[cooldownKey] = now;
        rule.executionsThisHour = executionTimestamps[rule.id].length;
        rule.totalExecutions = (rule.totalExecutions || 0) + 1;
        rule.lastTriggeredAt = new Date().toISOString();
        dbStore.saveRule(rule);

        // Record execution
        dbStore.saveExecution({
          id: `exec_${Date.now()}`,
          ruleId: rule.id,
          ruleName: rule.name,
          pageId: pageId,
          postId: comment.postId,
          commentId: comment.commentId,
          commentText: comment.message,
          actionTaken: 'REPLIED_WITH_TEMPLATE',
          status: 'SUCCESS',
          reason: `Matched condition [${rule.conditions.keywords.join(', ')}]`,
          apiResponseStatus: 200,
          responseCommentId: replyResult.replyCommentId,
          executionTimeMs: Date.now() - startTime,
          createdAt: new Date().toISOString(),
        });

        return {
          moderated: false,
          automatedReply: true,
          ruleId: rule.id,
          details: `Successfully replied to comment with rule "${rule.name}"`,
        };
      } catch (err: any) {
        dbStore.saveExecution({
          id: `exec_${Date.now()}`,
          ruleId: rule.id,
          ruleName: rule.name,
          pageId: pageId,
          postId: comment.postId,
          commentId: comment.commentId,
          commentText: comment.message,
          actionTaken: 'REPLY_FAILED',
          status: 'FAILED',
          reason: err.message,
          executionTimeMs: Date.now() - startTime,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return {
      moderated: false,
      automatedReply: false,
      details: 'No matching automation rules found for comment.',
    };
  }

  /**
   * Evaluates if comment satisfies a rule's conditions.
   */
  private static evaluateCondition(text: string, rule: AutomationRule): boolean {
    const { keywords, matchType, caseInsensitive, logic } = rule.conditions;
    if (!keywords || keywords.length === 0) return false;

    const source = caseInsensitive ? text.toLowerCase() : text;

    const matches = keywords.map((kw) => {
      const target = caseInsensitive ? kw.toLowerCase() : kw;
      if (matchType === 'EXACT') {
        return source.trim() === target.trim();
      } else if (matchType === 'REGEX') {
        try {
          const reg = new RegExp(target, caseInsensitive ? 'i' : '');
          return reg.test(source);
        } catch {
          return false;
        }
      } else {
        // CONTAINS
        return source.includes(target);
      }
    });

    if (logic === 'AND') {
      return matches.every(Boolean);
    } else {
      // OR
      return matches.some(Boolean);
    }
  }

  /**
   * Checks comment against moderation rules.
   */
  private static checkModerationMatch(text: string, rule: ModerationRule): boolean {
    const lower = text.toLowerCase();

    // Check allowlist first: if an allowlisted keyword matches, do not block
    if (rule.allowlistKeywords && rule.allowlistKeywords.length > 0) {
      for (const allow of rule.allowlistKeywords) {
        if (lower.includes(allow.toLowerCase())) return false;
      }
    }

    // Check blocklist
    for (const block of rule.blocklistKeywords) {
      if (lower.includes(block.toLowerCase())) return true;
    }

    return false;
  }
}

import {
  FacebookConnection,
  FacebookPage,
  Post,
  ScheduledPost,
  Comment,
  CommentTemplate,
  AutomationRule,
  AutomationExecution,
  ModerationRule,
  ActivityLog,
  AppSettings,
  User,
} from './types';

export interface AuthStatusResponse {
  user: User;
  isConnected: boolean;
  connection: FacebookConnection | null;
  pagesCount: number;
  activePage?: FacebookPage;
  settings: AppSettings;
  sandboxFallbackAllowed?: boolean;
  isDemoMode?: boolean;
}

export const api = {
  // Auth
  async getAuthStatus(): Promise<AuthStatusResponse> {
    const res = await fetch('/api/auth/status');
    if (!res.ok) throw new Error('Failed to get auth status');
    return res.json();
  },

  async getOAuthUrl(): Promise<{ url: string; isConfigured: boolean; redirectUri: string; state: string }> {
    const res = await fetch('/api/auth/url');
    if (!res.ok) throw new Error('Failed to generate Meta OAuth URL');
    return res.json();
  },

  /**
   * Starts Facebook OAuth using popup window per oauth-integration skill.
   */
  startOAuthPopup(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const { url } = await this.getOAuthUrl();
        const width = 640;
        const height = 720;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const authWindow = window.open(
          url,
          'meta_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0,location=0,menubar=0`
        );

        if (!authWindow) {
          throw new Error('OAuth popup window was blocked by browser. Please allow popups for PagePilot.');
        }

        const handleMessage = (event: MessageEvent) => {
          // Check for success message from our callback HTML
          if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            resolve(true);
          }
        };

        window.addEventListener('message', handleMessage);

        // Fallback timer to check if window was closed manually
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            resolve(true);
          }
        }, 800);
      } catch (err) {
        reject(err);
      }
    });
  },

  async disconnectFacebook(): Promise<void> {
    const res = await fetch('/api/auth/disconnect', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to disconnect Facebook');
  },

  async debugToken(): Promise<any> {
    const res = await fetch('/api/auth/debug-token');
    return res.json();
  },

  // Pages
  async getPages(): Promise<{ pages: FacebookPage[] }> {
    const res = await fetch('/api/pages');
    return res.json();
  },

  async selectPage(pageId: string): Promise<FacebookPage> {
    const res = await fetch('/api/pages/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId }),
    });
    const data = await res.json();
    return data.page;
  },

  async togglePageConnect(pageId: string, isConnected: boolean): Promise<FacebookPage> {
    const res = await fetch('/api/pages/toggle-connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId, isConnected }),
    });
    const data = await res.json();
    return data.page;
  },

  async syncPages(): Promise<FacebookPage[]> {
    const res = await fetch('/api/pages/sync', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to sync pages');
    return data.pages;
  },

  // Posts
  async getPosts(pageId?: string, search?: string, status?: string): Promise<{ posts: Post[] }> {
    const params = new URLSearchParams();
    if (pageId) params.append('pageId', pageId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const res = await fetch(`/api/posts?${params.toString()}`);
    return res.json();
  },

  async createPost(payload: {
    pageId: string;
    message: string;
    postType: 'TEXT' | 'LINK' | 'PHOTO' | 'VIDEO';
    linkUrl?: string;
    photoUrl?: string;
    videoUrl?: string;
  }): Promise<Post> {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to publish post');
    return data.post;
  },

  async deletePost(id: string): Promise<void> {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete post');
  },

  // Scheduled
  async getScheduledPosts(pageId?: string): Promise<{ scheduled: ScheduledPost[] }> {
    const params = pageId ? `?pageId=${pageId}` : '';
    const res = await fetch(`/api/posts/scheduled${params}`);
    return res.json();
  },

  async schedulePost(payload: {
    pageId: string;
    message: string;
    postType: 'TEXT' | 'LINK' | 'PHOTO' | 'VIDEO';
    linkUrl?: string;
    photoUrl?: string;
    videoUrl?: string;
    scheduledTime: string;
    timezone?: string;
  }): Promise<{ post: Post; scheduledPost: ScheduledPost }> {
    const res = await fetch('/api/posts/scheduled', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to schedule post');
    return data;
  },

  async cancelScheduledPost(id: string): Promise<void> {
    const res = await fetch(`/api/posts/scheduled/${id}/cancel`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to cancel scheduled post');
  },

  async retryScheduledPost(id: string): Promise<void> {
    const res = await fetch(`/api/posts/scheduled/${id}/retry`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to retry post');
  },

  // Comments
  async getComments(pageId?: string, postId?: string, search?: string): Promise<{ comments: Comment[] }> {
    const params = new URLSearchParams();
    if (pageId) params.append('pageId', pageId);
    if (postId) params.append('postId', postId);
    if (search) params.append('search', search);
    const res = await fetch(`/api/comments?${params.toString()}`);
    return res.json();
  },

  async replyComment(commentId: string, message: string): Promise<{ success: boolean; comment: Comment }> {
    const res = await fetch(`/api/comments/${commentId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reply to comment');
    return data;
  },

  async toggleHideComment(commentId: string, isHidden: boolean): Promise<Comment> {
    const res = await fetch(`/api/comments/${commentId}/hide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isHidden }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update comment');
    return data.comment;
  },

  async deleteComment(commentId: string): Promise<void> {
    const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete comment');
  },

  // Templates
  async getTemplates(pageId?: string): Promise<{ templates: CommentTemplate[] }> {
    const params = pageId ? `?pageId=${pageId}` : '';
    const res = await fetch(`/api/templates${params}`);
    return res.json();
  },

  async saveTemplate(tmpl: Partial<CommentTemplate>): Promise<CommentTemplate> {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tmpl),
    });
    const data = await res.json();
    return data.template;
  },

  async deleteTemplate(id: string): Promise<void> {
    await fetch(`/api/templates/${id}`, { method: 'DELETE' });
  },

  // Automations
  async getAutomations(pageId?: string): Promise<{ rules: AutomationRule[]; executions: AutomationExecution[] }> {
    const params = pageId ? `?pageId=${pageId}` : '';
    const res = await fetch(`/api/automations${params}`);
    return res.json();
  },

  async saveAutomation(rule: Partial<AutomationRule>): Promise<AutomationRule> {
    const res = await fetch('/api/automations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    const data = await res.json();
    return data.rule;
  },

  async toggleAutomation(id: string): Promise<AutomationRule> {
    const res = await fetch(`/api/automations/${id}/toggle`, { method: 'POST' });
    const data = await res.json();
    return data.rule;
  },

  async deleteAutomation(id: string): Promise<void> {
    await fetch(`/api/automations/${id}`, { method: 'DELETE' });
  },

  // Moderation
  async getModerationRules(pageId?: string): Promise<{ rules: ModerationRule[] }> {
    const params = pageId ? `?pageId=${pageId}` : '';
    const res = await fetch(`/api/moderation${params}`);
    return res.json();
  },

  async saveModerationRule(rule: Partial<ModerationRule>): Promise<ModerationRule> {
    const res = await fetch('/api/moderation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    const data = await res.json();
    return data.rule;
  },

  async deleteModerationRule(id: string): Promise<void> {
    await fetch(`/api/moderation/${id}`, { method: 'DELETE' });
  },

  // Reactions
  async getReactionStatus(pageId?: string): Promise<any> {
    const params = pageId ? `?pageId=${pageId}` : '';
    const res = await fetch(`/api/reactions/status${params}`);
    return res.json();
  },

  async triggerReaction(pageId: string, postId: string): Promise<any> {
    const res = await fetch('/api/reactions/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId, postId }),
    });
    return res.json();
  },

  // Analytics
  async getAnalytics(pageId?: string): Promise<any> {
    const params = pageId ? `?pageId=${pageId}` : '';
    const res = await fetch(`/api/analytics${params}`);
    return res.json();
  },

  // Activity
  async getActivityLogs(filter?: { pageId?: string; status?: string; actionType?: string }): Promise<{ logs: ActivityLog[] }> {
    const params = new URLSearchParams();
    if (filter?.pageId) params.append('pageId', filter.pageId);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.actionType) params.append('actionType', filter.actionType);
    const res = await fetch(`/api/activity?${params.toString()}`);
    return res.json();
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    const res = await fetch('/api/settings');
    return res.json();
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    return data.settings;
  },

  // Simulator & Webhooks
  async simulateWebhookComment(payload: {
    pageId: string;
    postId: string;
    commenterName: string;
    message: string;
  }): Promise<any> {
    const res = await fetch('/api/webhooks/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async resetSeed(): Promise<void> {
    await fetch('/api/simulator/reseed', { method: 'POST' });
  },

  async enterDemo(): Promise<boolean> {
    const res = await fetch('/api/simulator/enter-demo', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to enter sandbox demo');
    }
    return true;
  },
};

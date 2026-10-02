import { decryptToken, encryptToken } from './cryptoService.ts';
import { dbStore } from '../db/store.ts';
import { FacebookPage } from '../types.ts';

const META_API_VERSION = process.env.META_API_VERSION || 'v21.0';
const GRAPH_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export class MetaPageService {
  /**
   * Syncs and retrieves authorized Facebook Pages for the authenticated user.
   */
  static async syncPages(userId: string): Promise<FacebookPage[]> {
    const conn = dbStore.getConnectionByUserId(userId);
    if (!conn) {
      return dbStore.getPages(userId);
    }

    if (conn.isSandboxMode) {
      return dbStore.getPages(userId);
    }

    const userToken = decryptToken(conn.encryptedUserAccessToken);
    if (!userToken) {
      throw new Error('Invalid user access token');
    }

    const fields = 'id,name,category,tasks,access_token,picture.type(large),followers_count,fan_count';
    const res = await fetch(`${GRAPH_BASE_URL}/me/accounts?fields=${fields}&access_token=${userToken}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to retrieve Facebook Pages from Meta Graph API');
    }

    const syncedPages: FacebookPage[] = [];
    const rawPages = data.data || [];

    for (let i = 0; i < rawPages.length; i++) {
      const p = rawPages[i];
      const existing = dbStore.getPage(p.id);

      const page: FacebookPage = {
        id: existing?.id || `page_${p.id}`,
        pageId: p.id,
        name: p.name,
        category: p.category || 'Business Page',
        tasks: p.tasks || ['MANAGE'],
        pictureUrl: p.picture?.data?.url || existing?.pictureUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        followersCount: p.followers_count || existing?.followersCount || 0,
        fanCount: p.fan_count || existing?.fanCount || 0,
        isConnected: existing ? existing.isConnected : true,
        isDefault: existing ? existing.isDefault : i === 0,
        userId: userId,
        connectionId: conn.id,
        encryptedPageAccessToken: encryptToken(p.access_token),
        lastSyncedAt: new Date().toISOString(),
      };

      dbStore.savePage(page);
      syncedPages.push(page);

      // Attempt to subscribe page to app webhooks for real-time events
      this.subscribePageToWebhooks(page).catch((err) => {
        console.warn(`Could not subscribe page ${page.name} to webhooks:`, err.message);
      });
    }

    return syncedPages;
  }

  /**
   * Subscribes a Facebook Page to this app for real-time webhook updates.
   * Endpoint: POST /{page-id}/subscribed_apps
   */
  static async subscribePageToWebhooks(page: FacebookPage): Promise<boolean> {
    const pageToken = decryptToken(page.encryptedPageAccessToken);
    if (!pageToken || pageToken.includes('sandbox')) return true;

    try {
      const res = await fetch(`${GRAPH_BASE_URL}/${page.pageId}/subscribed_apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscribed_fields: ['feed', 'mention'],
          access_token: pageToken,
        }),
      });
      const result = await res.json();
      return result.success === true;
    } catch {
      return false;
    }
  }

  /**
   * Selects an active page.
   */
  static selectPage(pageId: string) {
    dbStore.setDefaultPage(pageId);
    return dbStore.getPage(pageId);
  }

  /**
   * Disconnects a page.
   */
  static disconnectPage(pageId: string) {
    return dbStore.togglePageConnection(pageId, false);
  }

  /**
   * Reconnects a page.
   */
  static connectPage(pageId: string) {
    return dbStore.togglePageConnection(pageId, true);
  }
}

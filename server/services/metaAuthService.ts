import { encryptToken, decryptToken } from './cryptoService.ts';
import { dbStore } from '../db/store.ts';
import { FacebookConnection } from '../types.ts';

const META_API_VERSION = process.env.META_API_VERSION || 'v21.0';
const GRAPH_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export const REQUIRED_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'pages_manage_metadata',
  'pages_read_user_content',
  'public_profile',
  'email',
];

export class MetaAuthService {
  /**
   * Generates official Facebook Login OAuth URL.
   */
  static getOAuthUrl(redirectUri: string, state: string): { url: string; isConfigured: boolean } {
    const appId = process.env.META_APP_ID || dbStore.getSettings().metaAppId;
    const isConfigured = !!appId && !!process.env.META_APP_SECRET;

    if (!appId) {
      // In sandbox/preview mode without developer credentials
      return {
        url: `${redirectUri}?simulated=true&state=${state}&code=simulated_auth_code_meta_v21`,
        isConfigured: false,
      };
    }

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      state: state,
      response_type: 'code',
      scope: REQUIRED_SCOPES.join(','),
      auth_type: 'reauthenticate',
    });

    return {
      url: `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?${params.toString()}`,
      isConfigured: true,
    };
  }

  /**
   * Revokes the app authorization on Meta Graph API using DELETE /{user-id}/permissions
   */
  static async revokePermissions(userId: string): Promise<{ success: boolean; message: string }> {
    const conn = dbStore.getConnectionByUserId(userId);
    if (!conn) {
      return { success: true, message: 'No active connection to revoke.' };
    }

    const decrypted = decryptToken(conn.encryptedUserAccessToken);
    const fbUserId = conn.facebookUserId;

    if (!decrypted || conn.isSandboxMode || decrypted.includes('sandbox') || decrypted.includes('sample')) {
      console.log(`[MetaAuthService] Sandbox connection for ${conn.facebookUserName} revoked locally.`);
      return { success: true, message: 'Sandbox permissions cleared.' };
    }

    try {
      const revokeUrl = `${GRAPH_BASE_URL}/${fbUserId}/permissions?access_token=${encodeURIComponent(decrypted)}`;
      console.log(`[MetaAuthService] Calling Meta Graph API: DELETE ${GRAPH_BASE_URL}/${fbUserId}/permissions`);
      const res = await fetch(revokeUrl, {
        method: 'DELETE',
      });
      const data = await res.json();
      console.log('[MetaAuthService] Revoke permissions response:', data);
      return {
        success: data.success === true,
        message: data.success ? 'Permissions revoked on Meta' : (data.error?.message || 'Revoked'),
      };
    } catch (err: any) {
      console.error('[MetaAuthService] Error revoking permissions on Meta Graph API:', err);
      return { success: false, message: err.message };
    }
  }

  /**
   * Exchanges authorization code for a long-lived user access token.
   */
  static async handleOAuthCallback(code: string, redirectUri: string): Promise<FacebookConnection> {
    const appId = process.env.META_APP_ID || dbStore.getSettings().metaAppId;
    const appSecret = process.env.META_APP_SECRET;
    const user = dbStore.getDefaultUser();

    if (!appId || !appSecret || code.startsWith('simulated_')) {
      // Sandbox fallback mode
      const connection: FacebookConnection = {
        id: `conn_${Date.now()}`,
        userId: user.id,
        facebookUserId: '109283746192834',
        facebookUserName: 'Demo user',
        encryptedUserAccessToken: encryptToken('EAAX_sandbox_user_token_valid_v21'),
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
        scopes: REQUIRED_SCOPES,
        isValid: true,
        lastSyncedAt: new Date().toISOString(),
        apiVersion: META_API_VERSION,
        isSandboxMode: true,
      };
      dbStore.saveConnection(connection);
      return connection;
    }

    // Step 1: Exchange code for short-lived user token
    const tokenUrl = `${GRAPH_BASE_URL}/oauth/access_token?` + new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code: code,
    });

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      throw new Error(tokenData.error?.message || 'Failed to exchange Meta OAuth code.');
    }

    const shortLivedToken = tokenData.access_token;

    // Step 2: Exchange short-lived token for 60-day long-lived token
    const longLivedUrl = `${GRAPH_BASE_URL}/oauth/access_token?` + new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLivedToken,
    });

    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    const finalToken = longLivedData.access_token || shortLivedToken;
    const expiresInSeconds = longLivedData.expires_in || tokenData.expires_in || 5184000;

    // Step 3: Fetch Meta User Profile with real name and ID via official Graph API (GET /me?fields=id,name)
    const profileUrl = `${GRAPH_BASE_URL}/me?fields=id,name&access_token=${encodeURIComponent(finalToken)}`;
    console.log(`[MetaAuthService] Calling official Graph API GET /me?fields=id,name`);
    const profileRes = await fetch(profileUrl);
    const profile = await profileRes.json();

    if (!profileRes.ok || profile.error || !profile.id) {
      console.error('[MetaAuthService] Error fetching user profile from Meta Graph API /me:', profile);
      throw new Error(profile.error?.message || 'Failed to fetch user identity from Meta Graph API GET /me');
    }

    const connection: FacebookConnection = {
      id: `conn_${Date.now()}`,
      userId: user.id,
      facebookUserId: String(profile.id),
      facebookUserName: String(profile.name || 'Facebook User'),
      encryptedUserAccessToken: encryptToken(finalToken),
      tokenExpiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
      scopes: REQUIRED_SCOPES,
      isValid: true,
      lastSyncedAt: new Date().toISOString(),
      apiVersion: META_API_VERSION,
      isSandboxMode: false,
    };

    dbStore.saveConnection(connection);
    return connection;
  }

  /**
   * Inspect token using /debug_token to audit permissions and expiry.
   */
  static async debugToken(userId: string): Promise<any> {
    const conn = dbStore.getConnectionByUserId(userId);
    if (!conn) {
      return { isValid: false, message: 'No active Facebook connection found.' };
    }

    const decrypted = decryptToken(conn.encryptedUserAccessToken);
    const appId = process.env.META_APP_ID || dbStore.getSettings().metaAppId;
    const appSecret = process.env.META_APP_SECRET;

    if (conn.isSandboxMode || !appId || !appSecret) {
      return {
        isValid: true,
        appId: appId || 'sandbox_app_id',
        type: 'USER',
        application: 'PagePilot Production Suite',
        dataAccessExpiresAt: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
        expiresAt: conn.tokenExpiresAt,
        isValidToken: true,
        scopes: conn.scopes,
        userId: conn.facebookUserId,
        isSandbox: true,
        requiredScopesCheck: REQUIRED_SCOPES.map((scope) => ({
          scope,
          granted: true,
          status: 'OFFICIALLY_GRANTED',
        })),
      };
    }

    try {
      const debugUrl = `${GRAPH_BASE_URL}/debug_token?input_token=${decrypted}&access_token=${appId}|${appSecret}`;
      const res = await fetch(debugUrl);
      const data = await res.json();
      return {
        ...data.data,
        isSandbox: false,
        requiredScopesCheck: REQUIRED_SCOPES.map((scope) => ({
          scope,
          granted: data.data?.scopes?.includes(scope) || false,
          status: data.data?.scopes?.includes(scope) ? 'OFFICIALLY_GRANTED' : 'MISSING',
        })),
      };
    } catch (err: any) {
      return { isValid: false, error: err.message };
    }
  }
}

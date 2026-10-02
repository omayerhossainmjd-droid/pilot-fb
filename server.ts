import 'dotenv/config';
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbStore } from './server/db/store.ts';
import { MetaAuthService } from './server/services/metaAuthService.ts';
import { MetaPageService } from './server/services/metaPageService.ts';
import { MetaPostService } from './server/services/metaPostService.ts';
import { MetaCommentService } from './server/services/metaCommentService.ts';
import { MetaReactionService } from './server/services/metaReactionService.ts';
import { MetaAnalyticsService } from './server/services/metaAnalyticsService.ts';
import { AutomationService } from './server/services/automationService.ts';
import { SchedulerService } from './server/services/schedulerService.ts';
import { WebhookService } from './server/services/webhookService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware for cookie parsing with SameSite: 'none' and Secure: true for iframe context
app.use(cookieParser());

// Capture raw body for webhook HMAC-SHA256 signature verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Start background scheduler worker for scheduled posts
SchedulerService.startSchedulerWorker();

// Determine base App URL
function getBaseAppUrl(req: Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

/* =========================================================================
   1. AUTHENTICATION & OAUTH ROUTES
   ========================================================================= */

// Get OAuth URL to open directly in client popup (as required by oauth-integration skill)
app.get('/api/auth/url', (req: Request, res: Response) => {
  const baseAppUrl = getBaseAppUrl(req);
  const redirectUri = `${baseAppUrl}/auth/callback`;
  // Fresh random state generated every single time
  const state = `st_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;

  const authData = MetaAuthService.getOAuthUrl(redirectUri, state);
  res.json({
    url: authData.url,
    isConfigured: authData.isConfigured,
    redirectUri,
    state,
  });
});

// OAuth Callback handler (handles both /auth/callback and /auth/callback/ and /api/auth/callback)
const oauthCallbackHandler = async (req: Request, res: Response) => {
  const code = (req.query.code as string) || 'simulated_code';
  const baseAppUrl = getBaseAppUrl(req);
  const redirectUri = `${baseAppUrl}/auth/callback`;

  try {
    await MetaAuthService.handleOAuthCallback(code, redirectUri);
    // Send postMessage to opener window and close popup (strictly per oauth-integration skill)
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PagePilot - Facebook Login Connected</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
            .card { background: #1e293b; padding: 32px; border-radius: 12px; text-align: center; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            .spinner { width: 36px; height: 36px; border: 3px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <h2 style="margin: 0 0 8px 0; font-size: 18px;">Meta Connection Verified</h2>
            <p style="margin: 0; color: #94a3b8; font-size: 14px;">Closing window and returning to PagePilot dashboard...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', service: 'facebook' }, '*');
                setTimeout(() => window.close(), 600);
              } else {
                window.location.href = '/dashboard';
              }
            } catch(e) {
              window.location.href = '/dashboard';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send(`
      <html>
        <body style="background:#0f172a; color:#f87171; font-family:sans-serif; padding:40px; text-align:center;">
          <h2>Meta OAuth Error</h2>
          <p>${err.message}</p>
          <button onclick="window.close()" style="padding:8px 16px; background:#334155; color:#fff; border:none; border-radius:6px; cursor:pointer;">Close Window</button>
        </body>
      </html>
    `);
  }
};

app.get(['/auth/callback', '/auth/callback/', '/api/auth/callback'], oauthCallbackHandler);

// Disconnect Facebook
app.post('/api/auth/disconnect', async (_req: Request, res: Response) => {
  try {
    const user = dbStore.getDefaultUser();

    // 1. Call official Graph API DELETE /{user-id}/permissions with the user token to revoke authorization
    await MetaAuthService.revokePermissions(user.id);

    // 2. Delete user's FacebookConnection, FacebookPage and PageToken records from server store
    dbStore.disconnectFacebook(user.id);

    // 3. Clear session and auth cookies
    res.clearCookie('session', { path: '/', sameSite: 'none', secure: true });
    res.clearCookie('token', { path: '/', sameSite: 'none', secure: true });
    res.clearCookie('meta_session', { path: '/', sameSite: 'none', secure: true });

    res.json({
      success: true,
      message: 'Disconnected Facebook account, cleared tokens, and revoked authorization on Meta Graph API.',
    });
  } catch (err: any) {
    console.error('Error disconnecting Facebook:', err);
    res.status(500).json({ error: err.message || 'Failed to disconnect Facebook' });
  }
});

// Explicit endpoint to enter sandbox demo workspace (only permitted if PAGEPILOT_SANDBOX_FALLBACK=true)
app.post('/api/simulator/enter-demo', (_req: Request, res: Response) => {
  if (process.env.PAGEPILOT_SANDBOX_FALLBACK !== 'true') {
    res.status(403).json({
      error: 'Sandbox demo fallback is disabled by configuration (PAGEPILOT_SANDBOX_FALLBACK !== true).',
    });
    return;
  }
  const user = dbStore.getDefaultUser();
  const success = dbStore.enterDemoWorkspace(user.id);
  res.json({ success, message: 'Entered sandbox demo workspace.' });
});

// Auth Status
app.get('/api/auth/status', (_req: Request, res: Response) => {
  const user = dbStore.getDefaultUser();
  const connection = dbStore.getConnectionByUserId(user.id);
  const pages = dbStore.getPages(user.id);
  const settings = dbStore.getSettings();
  const sandboxFallbackAllowed = process.env.PAGEPILOT_SANDBOX_FALLBACK === 'true';

  res.json({
    user,
    isConnected: !!connection && connection.isValid,
    connection: connection
      ? {
          id: connection.id,
          facebookUserName: connection.facebookUserName,
          facebookUserId: connection.facebookUserId,
          tokenExpiresAt: connection.tokenExpiresAt,
          scopes: connection.scopes,
          isValid: connection.isValid,
          lastSyncedAt: connection.lastSyncedAt,
          isSandboxMode: !!connection.isSandboxMode,
        }
      : null,
    pagesCount: pages.length,
    activePage: dbStore.getDefaultPage(),
    settings,
    sandboxFallbackAllowed,
    isDemoMode: !!connection?.isSandboxMode,
  });
});

// Debug Token
app.get('/api/auth/debug-token', async (_req: Request, res: Response) => {
  const user = dbStore.getDefaultUser();
  const debugData = await MetaAuthService.debugToken(user.id);
  res.json(debugData);
});

/* =========================================================================
   2. FACEBOOK PAGE MANAGEMENT ROUTES
   ========================================================================= */

app.get('/api/pages', (_req: Request, res: Response) => {
  const user = dbStore.getDefaultUser();
  const pages = dbStore.getPages(user.id);
  res.json({ pages });
});

app.post('/api/pages/select', (req: Request, res: Response) => {
  const { pageId } = req.body;
  if (!pageId) {
    res.status(400).json({ error: 'pageId is required' });
    return;
  }
  const page = MetaPageService.selectPage(pageId);
  res.json({ success: true, page });
});

app.post('/api/pages/toggle-connect', (req: Request, res: Response) => {
  const { pageId, isConnected } = req.body;
  const page = isConnected ? MetaPageService.connectPage(pageId) : MetaPageService.disconnectPage(pageId);
  res.json({ success: true, page });
});

app.post('/api/pages/sync', async (_req: Request, res: Response) => {
  try {
    const user = dbStore.getDefaultUser();
    const syncedPages = await MetaPageService.syncPages(user.id);
    res.json({ success: true, pages: syncedPages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   3. POSTS & SCHEDULED POSTS ROUTES
   ========================================================================= */

app.get('/api/posts', (req: Request, res: Response) => {
  const { pageId, search, status } = req.query as { pageId?: string; search?: string; status?: string };
  let posts = dbStore.getPosts(pageId);

  if (search) {
    const q = search.toLowerCase();
    posts = posts.filter((p) => p.message.toLowerCase().includes(q));
  }
  if (status) {
    posts = posts.filter((p) => p.status === status);
  }

  res.json({ posts });
});

app.post('/api/posts', async (req: Request, res: Response) => {
  try {
    const { pageId, message, postType = 'TEXT', linkUrl, photoUrl, videoUrl } = req.body;
    if (!pageId || !message) {
      res.status(400).json({ error: 'pageId and message are required' });
      return;
    }

    const post = await MetaPostService.publishPost(pageId, {
      message,
      postType,
      linkUrl,
      photoUrl,
      videoUrl,
    });

    res.json({ success: true, post });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/posts/:id', async (req: Request, res: Response) => {
  try {
    await MetaPostService.deletePost(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Scheduled Posts
app.get('/api/posts/scheduled', (req: Request, res: Response) => {
  const { pageId } = req.query as { pageId?: string };
  const scheduled = dbStore.getScheduledPosts(pageId);
  res.json({ scheduled });
});

app.post('/api/posts/scheduled', (req: Request, res: Response) => {
  try {
    const { pageId, message, postType = 'TEXT', linkUrl, photoUrl, videoUrl, scheduledTime, timezone } = req.body;
    if (!pageId || !message || !scheduledTime) {
      res.status(400).json({ error: 'pageId, message, and scheduledTime are required' });
      return;
    }

    const result = SchedulerService.schedulePost({
      pageId,
      message,
      postType,
      linkUrl,
      photoUrl,
      videoUrl,
      scheduledTime,
      timezone,
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/scheduled/:id/cancel', (req: Request, res: Response) => {
  const sched = SchedulerService.cancelScheduledPost(req.params.id);
  res.json({ success: true, scheduledPost: sched });
});

app.post('/api/posts/scheduled/:id/retry', async (req: Request, res: Response) => {
  try {
    const sched = await SchedulerService.retryScheduledPost(req.params.id);
    res.json({ success: true, scheduledPost: sched });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   4. COMMENTS & MODERATION ROUTES
   ========================================================================= */

app.get('/api/comments', (req: Request, res: Response) => {
  const { pageId, postId, search } = req.query as { pageId?: string; postId?: string; search?: string };
  let comments = dbStore.getComments(pageId, postId);

  if (search) {
    const q = search.toLowerCase();
    comments = comments.filter((c) => c.message.toLowerCase().includes(q) || c.fromName.toLowerCase().includes(q));
  }

  res.json({ comments });
});

app.post('/api/comments/:id/reply', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Reply message is required' });
      return;
    }
    const result = await MetaCommentService.replyToComment(req.params.id, message, 'MANUAL_REPLY');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/comments/:id/hide', async (req: Request, res: Response) => {
  try {
    const { isHidden } = req.body;
    const comment = await MetaCommentService.toggleHideComment(req.params.id, isHidden);
    res.json({ success: true, comment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/comments/:id', async (req: Request, res: Response) => {
  try {
    await MetaCommentService.deleteComment(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   5. AUTO COMMENT TEMPLATES & AUTOMATION RULES
   ========================================================================= */

// Templates
app.get('/api/templates', (req: Request, res: Response) => {
  const { pageId } = req.query as { pageId?: string };
  const templates = dbStore.getTemplates(pageId);
  res.json({ templates });
});

app.post('/api/templates', (req: Request, res: Response) => {
  const { id, name, replyText, pageId, keywords = [], status = 'ACTIVE' } = req.body;
  if (!name || !replyText || !pageId) {
    res.status(400).json({ error: 'name, replyText, and pageId are required' });
    return;
  }

  const template = {
    id: id || `tmpl_${Date.now()}`,
    name,
    replyText,
    pageId,
    keywords,
    status: status as 'ACTIVE' | 'INACTIVE',
    executionCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbStore.saveTemplate(template);
  res.json({ success: true, template });
});

app.delete('/api/templates/:id', (req: Request, res: Response) => {
  dbStore.deleteTemplate(req.params.id);
  res.json({ success: true });
});

// Automation Rules
app.get('/api/automations', (req: Request, res: Response) => {
  const { pageId } = req.query as { pageId?: string };
  const rules = dbStore.getRules(pageId);
  const executions = dbStore.getExecutions(pageId);
  res.json({ rules, executions });
});

app.post('/api/automations', (req: Request, res: Response) => {
  const { id, name, pageId, conditions, actions, isEnabled = true, cooldownSeconds = 60, maxExecutionsPerHour = 30 } = req.body;
  if (!name || !pageId || !conditions) {
    res.status(400).json({ error: 'name, pageId, and conditions are required' });
    return;
  }

  const existing = id ? dbStore.getRule(id) : null;
  const rule = {
    id: id || `rule_${Date.now()}`,
    name,
    pageId,
    triggerType: 'NEW_COMMENT' as const,
    conditions,
    actions,
    isEnabled,
    cooldownSeconds,
    maxExecutionsPerHour,
    executionsThisHour: existing?.executionsThisHour || 0,
    totalExecutions: existing?.totalExecutions || 0,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbStore.saveRule(rule);
  res.json({ success: true, rule });
});

app.post('/api/automations/:id/toggle', (req: Request, res: Response) => {
  const rule = dbStore.getRule(req.params.id);
  if (!rule) {
    res.status(404).json({ error: 'Rule not found' });
    return;
  }
  rule.isEnabled = !rule.isEnabled;
  dbStore.saveRule(rule);
  res.json({ success: true, rule });
});

app.delete('/api/automations/:id', (req: Request, res: Response) => {
  dbStore.deleteRule(req.params.id);
  res.json({ success: true });
});

// Moderation Rules
app.get('/api/moderation', (req: Request, res: Response) => {
  const { pageId } = req.query as { pageId?: string };
  const rules = dbStore.getModerationRules(pageId);
  res.json({ rules });
});

app.post('/api/moderation', (req: Request, res: Response) => {
  const { id, name, pageId, blocklistKeywords = [], allowlistKeywords = [], action = 'HIDE', isEnabled = true } = req.body;
  if (!name || !pageId) {
    res.status(400).json({ error: 'name and pageId are required' });
    return;
  }

  const rule = {
    id: id || `mod_${Date.now()}`,
    name,
    pageId,
    blocklistKeywords,
    allowlistKeywords,
    action: action as any,
    isEnabled,
    autoLog: true,
    createdAt: new Date().toISOString(),
  };

  dbStore.saveModerationRule(rule);
  res.json({ success: true, rule });
});

app.delete('/api/moderation/:id', (req: Request, res: Response) => {
  dbStore.deleteModerationRule(req.params.id);
  res.json({ success: true });
});

/* =========================================================================
   6. AUTO REACTION ENFORCEMENT ROUTE (Strictly verifies Meta Graph API support)
   ========================================================================= */

app.get('/api/reactions/status', (req: Request, res: Response) => {
  const { pageId } = req.query as { pageId?: string };
  const verification = MetaReactionService.verifyReactionSupport(pageId);
  res.json(verification);
});

app.post('/api/reactions/trigger', async (req: Request, res: Response) => {
  const { pageId, postId } = req.body;
  const result = await MetaReactionService.executeReaction(pageId, postId);
  // Returns HTTP 422 with official unsupport notice per user specification
  res.status(422).json(result);
});

/* =========================================================================
   7. ANALYTICS & ACTIVITY LOGS
   ========================================================================= */

app.get('/api/analytics', async (req: Request, res: Response) => {
  try {
    const pageId = (req.query.pageId as string) || dbStore.getDefaultPage()?.pageId;
    if (!pageId) {
      res.status(400).json({ error: 'No active page found' });
      return;
    }
    const data = await MetaAnalyticsService.getPageInsights(pageId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics/export', (req: Request, res: Response) => {
  const pageId = (req.query.pageId as string) || dbStore.getDefaultPage()?.pageId;
  if (!pageId) {
    res.status(400).json({ error: 'No page specified' });
    return;
  }
  const csv = MetaAnalyticsService.generateCsv(pageId);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=pagepilot-analytics-${pageId}.csv`);
  res.send(csv);
});

app.get('/api/activity', (req: Request, res: Response) => {
  const { pageId, status, actionType } = req.query as { pageId?: string; status?: string; actionType?: string };
  const logs = dbStore.getActivityLogs({ pageId, status, actionType });
  res.json({ logs });
});

/* =========================================================================
   8. WEBHOOKS & TEST SIMULATOR
   ========================================================================= */

// Official Meta Webhook verification handshake (GET)
app.get('/api/webhooks/facebook', (req: Request, res: Response) => {
  const query = req.query as any;
  const result = WebhookService.verifySubscription(query);
  if (result.isValid && result.challenge) {
    res.status(200).send(result.challenge);
  } else {
    res.status(403).send('Forbidden: Token mismatch.');
  }
});

// Official Meta Webhook receiver (POST)
app.post('/api/webhooks/facebook', async (req: any, res: Response) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const rawBody = req.rawBody || JSON.stringify(req.body);

  try {
    const result = await WebhookService.handleWebhookEvent(rawBody, signature);
    res.json(result);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Webhook simulation endpoint for live developer testing in UI
app.post('/api/webhooks/simulate', async (req: Request, res: Response) => {
  try {
    const { pageId, postId, commenterName, message } = req.body;
    const result = await WebhookService.simulateCommentEvent({
      pageId: pageId || dbStore.getDefaultPage()?.pageId || '102938475610293',
      postId: postId || 'post_01',
      commenterName: commenterName || 'Alex Mercer',
      message: message || 'What is the price of this plan?',
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   9. SETTINGS & APP STATE
   ========================================================================= */

app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(dbStore.getSettings());
});

app.put('/api/settings', (req: Request, res: Response) => {
  const updated = dbStore.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

app.post('/api/simulator/reseed', (_req: Request, res: Response) => {
  dbStore.resetSeed();
  res.json({ success: true, message: 'Database reset to initial demo state.' });
});

/* =========================================================================
   10. MOUNT VITE MIDDLEWARES IN DEV / SERVE STATIC IN PROD
   ========================================================================= */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PagePilot full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting PagePilot server:', err);
  process.exit(1);
});

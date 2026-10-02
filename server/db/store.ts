import fs from 'fs';
import path from 'path';
import {
  User,
  FacebookConnection,
  FacebookPage,
  Post,
  ScheduledPost,
  Comment,
  CommentTemplate,
  AutomationRule,
  AutomationExecution,
  ModerationRule,
  AnalyticsSnapshot,
  ActivityLog,
  Notification,
  AppSettings,
} from '../types.ts';
import { encryptToken } from '../services/cryptoService.ts';

interface DatabaseSchema {
  users: User[];
  connections: FacebookConnection[];
  pages: FacebookPage[];
  posts: Post[];
  scheduledPosts: ScheduledPost[];
  comments: Comment[];
  commentTemplates: CommentTemplate[];
  automationRules: AutomationRule[];
  automationExecutions: AutomationExecution[];
  moderationRules: ModerationRule[];
  analyticsSnapshots: AnalyticsSnapshot[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  settings: AppSettings;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DB_DIR, 'pagepilot-db.json');

const DEFAULT_SETTINGS: AppSettings = {
  defaultTimezone: 'America/New_York',
  maxRepliesPerHour: 50,
  defaultCooldownSeconds: 60,
  webhookVerifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN || 'pagepilot_meta_webhook_secret_token_2026',
  metaAppId: process.env.META_APP_ID || '',
  metaAppSecretConfigured: !!process.env.META_APP_SECRET,
  metaApiVersion: process.env.META_API_VERSION || 'v21.0',
  sandboxMode: true,
  rateLimitSafetyMarginPercent: 20,
};

function createEmptyData(): DatabaseSchema {
  const defaultUser: User = {
    id: 'user_default_01',
    email: 'admin@pagepilot.io',
    name: 'Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  };

  return {
    users: [defaultUser],
    connections: [],
    pages: [],
    posts: [],
    scheduledPosts: [],
    comments: [],
    commentTemplates: [],
    automationRules: [],
    automationExecutions: [],
    moderationRules: [],
    analyticsSnapshots: [],
    activityLogs: [],
    notifications: [],
    settings: DEFAULT_SETTINGS,
  };
}

function createDemoSeedData(): DatabaseSchema {
  const defaultUser: User = {
    id: 'user_default_01',
    email: 'admin@pagepilot.io',
    name: 'Alex Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  };

  const defaultConnection: FacebookConnection = {
    id: 'conn_fb_01',
    userId: defaultUser.id,
    facebookUserId: '109283746192834',
    facebookUserName: 'Demo user',
    encryptedUserAccessToken: encryptToken('EAAX_meta_sample_long_lived_user_access_token_secure_gcm'),
    tokenExpiresAt: new Date(Date.now() + 58 * 24 * 3600 * 1000).toISOString(),
    scopes: [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_manage_metadata',
      'pages_read_user_content',
      'public_profile',
      'email',
    ],
    isValid: true,
    lastSyncedAt: new Date().toISOString(),
    apiVersion: 'v21.0',
    isSandboxMode: true,
  };

  const page1: FacebookPage = {
    id: 'page_novatech_01',
    pageId: '102938475610293',
    name: 'NovaTech Digital',
    category: 'Software & Technology Company',
    tasks: ['MANAGE', 'CREATE_CONTENT', 'MODERATE', 'ADVERTISE', 'ANALYZE'],
    pictureUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    followersCount: 24500,
    fanCount: 23800,
    isConnected: true,
    isDefault: true,
    userId: defaultUser.id,
    connectionId: defaultConnection.id,
    encryptedPageAccessToken: encryptToken('EAAX_meta_sample_page_access_token_novatech_secure_gcm'),
    tokenExpiresAt: null, // Page tokens from 60-day user tokens never expire unless revoked
    lastSyncedAt: new Date().toISOString(),
  };

  const page2: FacebookPage = {
    id: 'page_aurora_02',
    pageId: '209384756192039',
    name: 'Aurora Apparel & Goods',
    category: 'E-commerce & Retail Brand',
    tasks: ['MANAGE', 'CREATE_CONTENT', 'MODERATE', 'ADVERTISE'],
    pictureUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&auto=format&fit=crop&q=80',
    followersCount: 14200,
    fanCount: 13950,
    isConnected: true,
    isDefault: false,
    userId: defaultUser.id,
    connectionId: defaultConnection.id,
    encryptedPageAccessToken: encryptToken('EAAX_meta_sample_page_access_token_aurora_secure_gcm'),
    tokenExpiresAt: null,
    lastSyncedAt: new Date().toISOString(),
  };

  const post1: Post = {
    id: 'post_01',
    postId: '102938475610293_1049283746192',
    pageId: page1.pageId,
    pageName: page1.name,
    message: '🚀 Exciting news! We just launched our AI Analytics 3.0 suite with real-time Meta Graph API intelligence. What features would you like to see next?',
    linkUrl: 'https://pagepilot.io/updates/v3',
    photoUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    postType: 'PHOTO',
    publishedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    permalink: 'https://facebook.com/102938475610293/posts/1049283746192',
    likeCount: 342,
    commentCount: 28,
    shareCount: 45,
    reachCount: 8900,
    impressionsCount: 12400,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  };

  const post2: Post = {
    id: 'post_02',
    postId: '102938475610293_1049283746999',
    pageId: page1.pageId,
    pageName: page1.name,
    message: '💡 Pro-tip for creators: Automating routine comment questions (pricing, location, hours) frees up 80% of community manager time while preserving 100% human connection for nuanced inquiries.',
    status: 'PUBLISHED',
    postType: 'TEXT',
    publishedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    permalink: 'https://facebook.com/102938475610293/posts/1049283746999',
    likeCount: 189,
    commentCount: 14,
    shareCount: 19,
    reachCount: 5200,
    impressionsCount: 7100,
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  };

  const post3: Post = {
    id: 'post_03',
    pageId: page1.pageId,
    pageName: page1.name,
    message: 'Weekly community spotlight: How our customers scaled automated customer satisfaction by 400% using compliant Meta Graph API webhooks.',
    photoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    status: 'SCHEDULED',
    postType: 'PHOTO',
    scheduledFor: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    reachCount: 0,
    impressionsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const scheduledPost1: ScheduledPost = {
    id: 'sched_01',
    postId: post3.id,
    post: post3,
    scheduledTime: post3.scheduledFor!,
    timezone: 'America/New_York',
    retryCount: 0,
    maxRetries: 3,
    status: 'QUEUED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const comments: Comment[] = [
    {
      id: 'cmt_01',
      commentId: '1049283746192_c101',
      postId: post1.postId!,
      postMessage: post1.message,
      pageId: page1.pageId,
      fromId: 'user_fb_882',
      fromName: 'Sarah Jenkins',
      fromPictureUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      message: 'Could you share the price details for enterprise tier licenses?',
      createdTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      isHidden: false,
      isDeleted: false,
      canReply: true,
      canHide: true,
      canDelete: true,
      processedAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
      replyCommentId: '1049283746192_rep01',
      replies: [
        {
          id: '1049283746192_rep01',
          message: 'Thanks for your interest! Please send us a message or visit our pricing page at pagepilot.io/pricing for full tier details.',
          createdTime: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
          fromName: 'NovaTech Digital',
        },
      ],
    },
    {
      id: 'cmt_02',
      commentId: '1049283746192_c102',
      postId: post1.postId!,
      postMessage: post1.message,
      pageId: page1.pageId,
      fromId: 'user_fb_991',
      fromName: 'Marcus Chen',
      fromPictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      message: 'Where is your primary office location situated for workshops?',
      createdTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      isHidden: false,
      isDeleted: false,
      canReply: true,
      canHide: true,
      canDelete: true,
      processedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      replyCommentId: '1049283746192_rep02',
      replies: [
        {
          id: '1049283746192_rep02',
          message: 'Our location details and event calendar are available on our official Page info tab! Feel free to stop by.',
          createdTime: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
          fromName: 'NovaTech Digital',
        },
      ],
    },
    {
      id: 'cmt_03',
      commentId: '1049283746999_c103',
      postId: post2.postId!,
      postMessage: post2.message,
      pageId: page1.pageId,
      fromId: 'user_fb_445',
      fromName: 'Elena Rostova',
      fromPictureUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      message: 'Does this comply with the 2026 Meta Graph API safety standards?',
      createdTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      isHidden: false,
      isDeleted: false,
      canReply: true,
      canHide: true,
      canDelete: true,
    },
    {
      id: 'cmt_04',
      commentId: '1049283746999_c104',
      postId: post2.postId!,
      postMessage: post2.message,
      pageId: page1.pageId,
      fromId: 'user_fb_773',
      fromName: 'Crypt0 King 99',
      fromPictureUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      message: 'FREE CRYPTO AIRDROP CLICK HERE http://spam-link-not-allowed.xyz win $1000 now!!!',
      createdTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      isHidden: true,
      isDeleted: false,
      canReply: true,
      canHide: true,
      canDelete: true,
      processedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
  ];

  const commentTemplates: CommentTemplate[] = [
    {
      id: 'tmpl_price_01',
      name: 'Price & Pricing Inquiry',
      replyText: 'Thanks for your interest! Please send us a direct message or visit pagepilot.io/pricing for comprehensive plan details.',
      pageId: page1.pageId,
      keywords: ['price', 'pricing', 'cost', 'how much', 'rates'],
      status: 'ACTIVE',
      executionCount: 42,
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'tmpl_location_02',
      name: 'Location & Address Guide',
      replyText: 'Our physical location details and operating hours are available on our official Facebook Page info tab!',
      pageId: page1.pageId,
      keywords: ['location', 'address', 'where are you', 'office', 'directions'],
      status: 'ACTIVE',
      executionCount: 29,
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'tmpl_support_03',
      name: 'Customer Support Escalation',
      replyText: 'Hi there! Our support engineers are ready to assist you. Please email support@pagepilot.io or PM this page.',
      pageId: page1.pageId,
      keywords: ['support', 'help', 'broken', 'issue', 'bug'],
      status: 'ACTIVE',
      executionCount: 18,
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
  ];

  const automationRules: AutomationRule[] = [
    {
      id: 'rule_price_auto',
      name: 'Auto-Reply: Pricing Inquiries',
      pageId: page1.pageId,
      triggerType: 'NEW_COMMENT',
      conditions: {
        keywords: ['price', 'pricing', 'cost', 'how much'],
        matchType: 'CONTAINS',
        caseInsensitive: true,
        logic: 'OR',
      },
      actions: {
        replyTemplateId: 'tmpl_price_01',
        replyText: 'Thanks for your interest! Please send us a direct message or visit pagepilot.io/pricing for full tier details.',
        hideComment: false,
      },
      isEnabled: true,
      cooldownSeconds: 60,
      maxExecutionsPerHour: 30,
      executionsThisHour: 4,
      totalExecutions: 89,
      lastTriggeredAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rule_location_auto',
      name: 'Auto-Reply: Location Inquiries',
      pageId: page1.pageId,
      triggerType: 'NEW_COMMENT',
      conditions: {
        keywords: ['location', 'where', 'address'],
        matchType: 'CONTAINS',
        caseInsensitive: true,
        logic: 'OR',
      },
      actions: {
        replyTemplateId: 'tmpl_location_02',
        replyText: 'Our physical location details and operating hours are available on our official Facebook Page info tab!',
        hideComment: false,
      },
      isEnabled: true,
      cooldownSeconds: 60,
      maxExecutionsPerHour: 20,
      executionsThisHour: 2,
      totalExecutions: 45,
      lastTriggeredAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const moderationRules: ModerationRule[] = [
    {
      id: 'mod_spam_01',
      name: 'Crypto & Scam Keyword Shield',
      pageId: page1.pageId,
      blocklistKeywords: ['airdrop', 'crypto airdrop', 'free btc', 't.me/', 'whatsapp +', 'win $', 'investment guaranteed'],
      allowlistKeywords: ['bitcoin tech', 'cryptography'],
      action: 'HIDE',
      isEnabled: true,
      autoLog: true,
      createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    },
  ];

  const automationExecutions: AutomationExecution[] = [
    {
      id: 'exec_01',
      ruleId: 'rule_price_auto',
      ruleName: 'Auto-Reply: Pricing Inquiries',
      pageId: page1.pageId,
      pageName: page1.name,
      postId: post1.postId,
      commentId: comments[0].commentId,
      commentText: comments[0].message,
      actionTaken: 'POSTED_OFFICIAL_REPLY',
      status: 'SUCCESS',
      reason: 'Matched keyword "price" (case-insensitive CONTAINS)',
      apiResponseStatus: 200,
      responseCommentId: '1049283746192_rep01',
      executionTimeMs: 142,
      createdAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    },
    {
      id: 'exec_02',
      ruleId: 'rule_location_auto',
      ruleName: 'Auto-Reply: Location Inquiries',
      pageId: page1.pageId,
      pageName: page1.name,
      postId: post1.postId,
      commentId: comments[1].commentId,
      commentText: comments[1].message,
      actionTaken: 'POSTED_OFFICIAL_REPLY',
      status: 'SUCCESS',
      reason: 'Matched keyword "location" (case-insensitive CONTAINS)',
      apiResponseStatus: 200,
      responseCommentId: '1049283746192_rep02',
      executionTimeMs: 118,
      createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    },
  ];

  const activityLogs: ActivityLog[] = [
    {
      id: 'log_01',
      userId: defaultUser.id,
      pageId: page1.pageId,
      pageName: page1.name,
      postId: post1.postId,
      commentId: comments[0].commentId,
      actionType: 'AUTO_REPLY_COMMENT',
      timestamp: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
      status: 'SUCCESS',
      apiResponseStatus: 200,
      details: 'Replied to Sarah Jenkins regarding pricing inquiry via official Graph API v21.0 POST /{comment-id}/comments',
      retryCount: 0,
    },
    {
      id: 'log_02',
      userId: defaultUser.id,
      pageId: page1.pageId,
      pageName: page1.name,
      postId: post1.postId,
      commentId: comments[1].commentId,
      actionType: 'AUTO_REPLY_COMMENT',
      timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      status: 'SUCCESS',
      apiResponseStatus: 200,
      details: 'Replied to Marcus Chen regarding location inquiry via official Graph API v21.0 POST /{comment-id}/comments',
      retryCount: 0,
    },
    {
      id: 'log_03',
      userId: defaultUser.id,
      pageId: page1.pageId,
      pageName: page1.name,
      postId: post2.postId,
      commentId: comments[3].commentId,
      actionType: 'MODERATION_HIDE_COMMENT',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      status: 'SUCCESS',
      apiResponseStatus: 200,
      details: 'Auto-hid comment from Crypt0 King 99 containing blocked keyword "airdrop" via official Graph API v21.0 POST /{comment-id} with is_hidden=true',
      retryCount: 0,
    },
    {
      id: 'log_04',
      userId: defaultUser.id,
      pageId: page1.pageId,
      pageName: page1.name,
      postId: post2.postId,
      actionType: 'PAGE_POST_PUBLISH',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      status: 'SUCCESS',
      apiResponseStatus: 200,
      details: 'Published text post to NovaTech Digital feed via official Graph API v21.0 POST /{page-id}/feed',
      retryCount: 0,
    },
  ];

  const notifications: Notification[] = [
    {
      id: 'notif_01',
      userId: defaultUser.id,
      type: 'SUCCESS',
      title: 'Meta Page Connected',
      message: 'Successfully verified official permissions for "NovaTech Digital" (Graph API v21.0).',
      read: false,
      actionUrl: '/pages',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 'notif_02',
      userId: defaultUser.id,
      type: 'INFO',
      title: 'Webhook Verification Active',
      message: 'PagePilot webhook endpoint is ready and securely bound to Meta App events.',
      read: false,
      actionUrl: '/settings',
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    },
  ];

  // Past 7 days analytics snapshots
  const analyticsSnapshots: AnalyticsSnapshot[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 3600 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    analyticsSnapshots.push({
      id: `snap_${page1.pageId}_${dateStr}`,
      pageId: page1.pageId,
      date: dateStr,
      impressions: 11000 + Math.floor(Math.sin(i) * 2000) + i * 450,
      reach: 7800 + Math.floor(Math.cos(i) * 1500) + i * 320,
      engagedUsers: 1450 + Math.floor(Math.sin(i * 2) * 300),
      postEngagements: 1980 + Math.floor(Math.sin(i) * 400),
      reactions: 520 + i * 30,
      comments: 65 + i * 8,
      shares: 42 + i * 4,
      newFollowers: 38 + i * 6,
    });
  }

  return {
    users: [defaultUser],
    connections: [defaultConnection],
    pages: [page1, page2],
    posts: [post1, post2, post3],
    scheduledPosts: [scheduledPost1],
    comments,
    commentTemplates,
    automationRules,
    automationExecutions,
    moderationRules,
    analyticsSnapshots,
    activityLogs,
    notifications,
    settings: DEFAULT_SETTINGS,
  };
}

class Store {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge with empty structure so missing fields default cleanly
        return {
          ...createEmptyData(),
          ...parsed,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        };
      }
    } catch (e) {
      console.warn('Failed to load local DB file, using clean initial data:', e);
    }
    const initial = process.env.PAGEPILOT_SANDBOX_FALLBACK === 'true' ? createDemoSeedData() : createEmptyData();
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave: DatabaseSchema = this.data) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write local DB file:', e);
    }
  }

  // Users
  getUser(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }
  getDefaultUser(): User {
    return this.data.users[0];
  }

  // Facebook Connections
  getConnectionByUserId(userId: string): FacebookConnection | undefined {
    return this.data.connections.find((c) => c.userId === userId && c.isValid);
  }
  getAllConnections(): FacebookConnection[] {
    return this.data.connections;
  }
  saveConnection(conn: FacebookConnection) {
    const idx = this.data.connections.findIndex((c) => c.id === conn.id);
    if (idx >= 0) {
      this.data.connections[idx] = conn;
    } else {
      this.data.connections.push(conn);
    }
    this.persist();
  }

  /**
   * Completely deletes the user's FacebookConnection, FacebookPage and PageToken records from server store,
   * along with any associated posts/comments/schedules, ensuring zero cached data remains.
   */
  disconnectFacebook(userId: string) {
    // 1. Remove connection
    this.data.connections = this.data.connections.filter((c) => c.userId !== userId);

    // 2. Remove all FacebookPage records
    const removedPageIds = new Set(this.data.pages.filter((p) => p.userId === userId).map((p) => p.pageId));
    this.data.pages = this.data.pages.filter((p) => p.userId !== userId);

    // 3. Remove all page-associated records to ensure clean slate
    this.data.posts = this.data.posts.filter((p) => !removedPageIds.has(p.pageId));
    this.data.scheduledPosts = this.data.scheduledPosts.filter((s) => s.post && !removedPageIds.has(s.post.pageId));
    this.data.comments = this.data.comments.filter((c) => !removedPageIds.has(c.pageId));
    this.data.automationRules = this.data.automationRules.filter((r) => !removedPageIds.has(r.pageId));
    this.data.commentTemplates = this.data.commentTemplates.filter((t) => !removedPageIds.has(t.pageId));
    this.data.moderationRules = this.data.moderationRules.filter((m) => !removedPageIds.has(m.pageId));
    this.data.analyticsSnapshots = this.data.analyticsSnapshots.filter((s) => !removedPageIds.has(s.pageId));
    this.data.automationExecutions = this.data.automationExecutions.filter((e) => !removedPageIds.has(e.pageId));

    this.persist();
  }

  /**
   * Enters the simulated sandbox demo workspace if enabled by configuration.
   */
  enterDemoWorkspace(userId: string): boolean {
    if (process.env.PAGEPILOT_SANDBOX_FALLBACK !== 'true') {
      return false;
    }
    const demo = createDemoSeedData();
    this.data.connections = demo.connections.map((c) => ({ ...c, userId }));
    this.data.pages = demo.pages.map((p) => ({ ...p, userId }));
    this.data.posts = demo.posts;
    this.data.scheduledPosts = demo.scheduledPosts;
    this.data.comments = demo.comments;
    this.data.commentTemplates = demo.commentTemplates;
    this.data.automationRules = demo.automationRules;
    this.data.automationExecutions = demo.automationExecutions;
    this.data.moderationRules = demo.moderationRules;
    this.data.analyticsSnapshots = demo.analyticsSnapshots;
    this.persist();
    return true;
  }

  // Facebook Pages
  getPages(userId?: string): FacebookPage[] {
    if (userId) {
      return this.data.pages.filter((p) => p.userId === userId);
    }
    return this.data.pages;
  }
  getPage(pageId: string): FacebookPage | undefined {
    return this.data.pages.find((p) => p.pageId === pageId || p.id === pageId);
  }
  getDefaultPage(): FacebookPage | undefined {
    return this.data.pages.find((p) => p.isDefault && p.isConnected) || this.data.pages.find((p) => p.isConnected);
  }
  savePage(page: FacebookPage) {
    const idx = this.data.pages.findIndex((p) => p.pageId === page.pageId);
    if (idx >= 0) {
      this.data.pages[idx] = page;
    } else {
      this.data.pages.push(page);
    }
    this.persist();
  }
  setDefaultPage(pageId: string) {
    this.data.pages = this.data.pages.map((p) => ({
      ...p,
      isDefault: p.pageId === pageId || p.id === pageId,
    }));
    this.persist();
  }
  togglePageConnection(pageId: string, isConnected: boolean) {
    const page = this.getPage(pageId);
    if (page) {
      page.isConnected = isConnected;
      this.persist();
    }
    return page;
  }

  // Posts
  getPosts(pageId?: string): Post[] {
    if (pageId) {
      return this.data.posts.filter((p) => p.pageId === pageId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return this.data.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  getPost(id: string): Post | undefined {
    return this.data.posts.find((p) => p.id === id || p.postId === id);
  }
  savePost(post: Post) {
    const idx = this.data.posts.findIndex((p) => p.id === post.id);
    if (idx >= 0) {
      this.data.posts[idx] = post;
    } else {
      this.data.posts.unshift(post);
    }
    this.persist();
  }
  deletePost(id: string) {
    this.data.posts = this.data.posts.filter((p) => p.id !== id && p.postId !== id);
    this.data.scheduledPosts = this.data.scheduledPosts.filter((s) => s.postId !== id);
    this.persist();
  }

  // Scheduled Posts
  getScheduledPosts(pageId?: string): ScheduledPost[] {
    const list = this.data.scheduledPosts.map((s) => {
      const post = this.getPost(s.postId);
      return { ...s, post };
    });
    if (pageId) {
      return list.filter((s) => s.post?.pageId === pageId);
    }
    return list;
  }
  getScheduledPost(id: string): ScheduledPost | undefined {
    const s = this.data.scheduledPosts.find((item) => item.id === id || item.postId === id);
    if (!s) return undefined;
    return { ...s, post: this.getPost(s.postId) };
  }
  saveScheduledPost(sched: ScheduledPost) {
    const idx = this.data.scheduledPosts.findIndex((s) => s.id === sched.id);
    if (idx >= 0) {
      this.data.scheduledPosts[idx] = sched;
    } else {
      this.data.scheduledPosts.unshift(sched);
    }
    this.persist();
  }
  cancelScheduledPost(id: string) {
    const s = this.data.scheduledPosts.find((item) => item.id === id);
    if (s) {
      s.status = 'CANCELLED';
      const post = this.getPost(s.postId);
      if (post) {
        post.status = 'DRAFT';
      }
      this.persist();
    }
  }

  // Comments
  getComments(pageId?: string, postId?: string): Comment[] {
    let list = this.data.comments;
    if (pageId) list = list.filter((c) => c.pageId === pageId);
    if (postId) list = list.filter((c) => c.postId === postId);
    return list.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());
  }
  getComment(commentId: string): Comment | undefined {
    return this.data.comments.find((c) => c.commentId === commentId || c.id === commentId);
  }
  saveComment(comment: Comment) {
    const idx = this.data.comments.findIndex((c) => c.commentId === comment.commentId || c.id === comment.id);
    if (idx >= 0) {
      this.data.comments[idx] = comment;
    } else {
      this.data.comments.unshift(comment);
    }
    this.persist();
  }
  deleteComment(commentId: string) {
    this.data.comments = this.data.comments.filter((c) => c.commentId !== commentId && c.id !== commentId);
    this.persist();
  }

  // Comment Templates
  getTemplates(pageId?: string): CommentTemplate[] {
    if (pageId) return this.data.commentTemplates.filter((t) => t.pageId === pageId);
    return this.data.commentTemplates;
  }
  getTemplate(id: string): CommentTemplate | undefined {
    return this.data.commentTemplates.find((t) => t.id === id);
  }
  saveTemplate(tmpl: CommentTemplate) {
    const idx = this.data.commentTemplates.findIndex((t) => t.id === tmpl.id);
    if (idx >= 0) {
      this.data.commentTemplates[idx] = tmpl;
    } else {
      this.data.commentTemplates.push(tmpl);
    }
    this.persist();
  }
  deleteTemplate(id: string) {
    this.data.commentTemplates = this.data.commentTemplates.filter((t) => t.id !== id);
    this.persist();
  }

  // Automation Rules
  getRules(pageId?: string): AutomationRule[] {
    if (pageId) return this.data.automationRules.filter((r) => r.pageId === pageId);
    return this.data.automationRules;
  }
  getRule(id: string): AutomationRule | undefined {
    return this.data.automationRules.find((r) => r.id === id);
  }
  saveRule(rule: AutomationRule) {
    const idx = this.data.automationRules.findIndex((r) => r.id === rule.id);
    if (idx >= 0) {
      this.data.automationRules[idx] = rule;
    } else {
      this.data.automationRules.push(rule);
    }
    this.persist();
  }
  deleteRule(id: string) {
    this.data.automationRules = this.data.automationRules.filter((r) => r.id !== id);
    this.persist();
  }

  // Automation Executions
  getExecutions(pageId?: string): AutomationExecution[] {
    if (pageId) return this.data.automationExecutions.filter((e) => e.pageId === pageId);
    return this.data.automationExecutions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  saveExecution(exec: AutomationExecution) {
    this.data.automationExecutions.unshift(exec);
    if (this.data.automationExecutions.length > 200) {
      this.data.automationExecutions.pop();
    }
    this.persist();
  }

  // Moderation Rules
  getModerationRules(pageId?: string): ModerationRule[] {
    if (pageId) return this.data.moderationRules.filter((m) => m.pageId === pageId);
    return this.data.moderationRules;
  }
  saveModerationRule(rule: ModerationRule) {
    const idx = this.data.moderationRules.findIndex((m) => m.id === rule.id);
    if (idx >= 0) {
      this.data.moderationRules[idx] = rule;
    } else {
      this.data.moderationRules.push(rule);
    }
    this.persist();
  }
  deleteModerationRule(id: string) {
    this.data.moderationRules = this.data.moderationRules.filter((m) => m.id !== id);
    this.persist();
  }

  // Analytics
  getAnalytics(pageId: string): AnalyticsSnapshot[] {
    return this.data.analyticsSnapshots.filter((s) => s.pageId === pageId).sort((a, b) => a.date.localeCompare(b.date));
  }

  // Activity Logs
  getActivityLogs(filter?: { pageId?: string; status?: string; actionType?: string }): ActivityLog[] {
    let logs = this.data.activityLogs;
    if (filter?.pageId) logs = logs.filter((l) => l.pageId === filter.pageId);
    if (filter?.status) logs = logs.filter((l) => l.status === filter.status);
    if (filter?.actionType) logs = logs.filter((l) => l.actionType === filter.actionType);
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  logActivity(log: ActivityLog) {
    this.data.activityLogs.unshift(log);
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs.pop();
    }
    this.persist();
  }

  // Notifications
  getNotifications(userId: string): Notification[] {
    return this.data.notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  addNotification(notif: Notification) {
    this.data.notifications.unshift(notif);
    this.persist();
  }
  markNotificationRead(id: string) {
    const n = this.data.notifications.find((item) => item.id === id);
    if (n) {
      n.read = true;
      this.persist();
    }
  }

  // Settings
  getSettings(): AppSettings {
    return this.data.settings;
  }
  updateSettings(partial: Partial<AppSettings>): AppSettings {
    this.data.settings = { ...this.data.settings, ...partial };
    this.persist();
    return this.data.settings;
  }

  // Reset/reseed for demo
  resetSeed() {
    this.data = createDemoSeedData();
    this.persist();
    return this.data;
  }
}

export const dbStore = new Store();

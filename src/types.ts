export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
export type PostType = 'TEXT' | 'LINK' | 'PHOTO' | 'VIDEO';
export type ScheduledStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type ActionStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'SKIPPED';
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface FacebookConnection {
  id: string;
  facebookUserName: string;
  facebookUserId: string;
  tokenExpiresAt: string | null;
  scopes: string[];
  isValid: boolean;
  lastSyncedAt: string;
  isSandboxMode?: boolean;
}

export interface FacebookPage {
  id: string;
  pageId: string;
  name: string;
  category: string;
  tasks: string[];
  pictureUrl: string;
  followersCount: number;
  fanCount: number;
  isConnected: boolean;
  isDefault: boolean;
  userId: string;
}

export interface Post {
  id: string;
  postId?: string;
  pageId: string;
  pageName?: string;
  message: string;
  linkUrl?: string;
  photoUrl?: string;
  videoUrl?: string;
  status: PostStatus;
  postType: PostType;
  publishedAt?: string;
  scheduledFor?: string;
  permalink?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  reachCount: number;
  impressionsCount: number;
  errorMessage?: string;
  createdAt: string;
}

export interface ScheduledPost {
  id: string;
  postId: string;
  post?: Post;
  scheduledTime: string;
  timezone: string;
  retryCount: number;
  maxRetries: number;
  status: ScheduledStatus;
  lastError?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  commentId: string;
  postId: string;
  postMessage?: string;
  pageId: string;
  fromId: string;
  fromName: string;
  fromPictureUrl?: string;
  message: string;
  createdTime: string;
  isHidden: boolean;
  isDeleted: boolean;
  canReply: boolean;
  canHide: boolean;
  canDelete: boolean;
  parentCommentId?: string;
  processedAt?: string;
  replyCommentId?: string;
  replies?: Array<{
    id: string;
    message: string;
    createdTime: string;
    fromName: string;
  }>;
}

export interface CommentTemplate {
  id: string;
  name: string;
  replyText: string;
  pageId: string;
  keywords: string[];
  status: 'ACTIVE' | 'INACTIVE';
  executionCount: number;
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  pageId: string;
  triggerType: 'NEW_COMMENT' | 'COMMENT_UPDATE';
  conditions: {
    keywords: string[];
    matchType: 'CONTAINS' | 'EXACT' | 'REGEX';
    caseInsensitive: boolean;
    logic: 'AND' | 'OR';
  };
  actions: {
    replyTemplateId?: string;
    replyText?: string;
    hideComment?: boolean;
  };
  isEnabled: boolean;
  cooldownSeconds: number;
  maxExecutionsPerHour: number;
  executionsThisHour: number;
  totalExecutions: number;
  lastTriggeredAt?: string;
  createdAt: string;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  ruleName?: string;
  pageId: string;
  pageName?: string;
  postId?: string;
  commentId?: string;
  commentText?: string;
  actionTaken: string;
  status: ActionStatus;
  reason?: string;
  apiResponseStatus?: number;
  responseCommentId?: string;
  executionTimeMs: number;
  createdAt: string;
}

export interface ModerationRule {
  id: string;
  name: string;
  pageId: string;
  blocklistKeywords: string[];
  allowlistKeywords: string[];
  action: 'HIDE' | 'DELETE_IF_SUPPORTED' | 'FLAG_FOR_REVIEW';
  isEnabled: boolean;
  autoLog: boolean;
  createdAt: string;
}

export interface AnalyticsSnapshot {
  id: string;
  pageId: string;
  date: string;
  impressions: number;
  reach: number;
  engagedUsers: number;
  postEngagements: number;
  reactions: number;
  comments: number;
  shares: number;
  newFollowers: number;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  pageId?: string;
  pageName?: string;
  postId?: string;
  commentId?: string;
  actionType: string;
  timestamp: string;
  status: ActionStatus;
  apiResponseStatus?: number;
  details?: string;
  errorMessage?: string;
  retryCount: number;
}

export interface AppSettings {
  defaultTimezone: string;
  maxRepliesPerHour: number;
  defaultCooldownSeconds: number;
  webhookVerifyToken: string;
  metaAppId: string;
  metaAppSecretConfigured: boolean;
  metaApiVersion: string;
  sandboxMode: boolean;
  rateLimitSafetyMarginPercent: number;
}

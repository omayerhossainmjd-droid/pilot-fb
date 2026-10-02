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
  createdAt: string;
}

export interface FacebookConnection {
  id: string;
  userId: string;
  facebookUserId: string;
  facebookUserName: string;
  encryptedUserAccessToken: string;
  tokenExpiresAt: string | null;
  scopes: string[];
  isValid: boolean;
  lastSyncedAt: string;
  appId?: string;
  apiVersion?: string;
  isSandboxMode?: boolean;
}

export interface FacebookPage {
  id: string;
  pageId: string; // Meta Page ID
  name: string;
  category: string;
  tasks: string[]; // e.g. "MANAGE", "CREATE_CONTENT", "MODERATE"
  pictureUrl: string;
  followersCount: number;
  fanCount: number;
  isConnected: boolean;
  isDefault: boolean;
  userId: string;
  connectionId: string;
  encryptedPageAccessToken: string;
  tokenExpiresAt?: string | null;
  lastSyncedAt: string;
}

export interface Post {
  id: string;
  postId?: string; // Meta Graph ID e.g. "102394829384_10293849102"
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
  updatedAt: string;
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
  updatedAt: string;
}

export interface Comment {
  id: string;
  commentId: string; // Meta Comment ID
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
  updatedAt: string;
}

export interface AutomationCondition {
  keywords: string[];
  matchType: 'CONTAINS' | 'EXACT' | 'REGEX';
  caseInsensitive: boolean;
  logic: 'AND' | 'OR';
}

export interface AutomationAction {
  replyTemplateId?: string;
  replyText?: string;
  hideComment?: boolean;
  tagUser?: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  pageId: string;
  triggerType: 'NEW_COMMENT' | 'COMMENT_UPDATE';
  conditions: AutomationCondition;
  actions: AutomationAction;
  isEnabled: boolean;
  cooldownSeconds: number; // e.g. 60
  maxExecutionsPerHour: number; // e.g. 30
  executionsThisHour: number;
  lastTriggeredAt?: string;
  totalExecutions: number;
  createdAt: string;
  updatedAt: string;
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

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
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

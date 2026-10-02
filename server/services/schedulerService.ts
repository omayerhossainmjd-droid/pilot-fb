import { dbStore } from '../db/store.ts';
import { ScheduledPost, Post } from '../types.ts';
import { MetaPostService } from './metaPostService.ts';

export class SchedulerService {
  private static timer: NodeJS.Timeout | null = null;
  private static isProcessing = false;

  /**
   * Initializes the scheduled posts worker ticker.
   */
  static startSchedulerWorker() {
    if (this.timer) return;
    // Check every 10 seconds for scheduled posts ready to publish
    this.timer = setInterval(() => {
      this.processDuePosts().catch((err) => {
        console.error('Error running scheduler loop:', err);
      });
    }, 10000);
  }

  static stopSchedulerWorker() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Schedules a new post for future publication.
   */
  static schedulePost(data: {
    pageId: string;
    message: string;
    postType: 'TEXT' | 'LINK' | 'PHOTO' | 'VIDEO';
    linkUrl?: string;
    photoUrl?: string;
    videoUrl?: string;
    scheduledTime: string;
    timezone?: string;
  }): { post: Post; scheduledPost: ScheduledPost } {
    const page = dbStore.getPage(data.pageId);
    if (!page) {
      throw new Error(`Page with ID ${data.pageId} not found.`);
    }

    const post: Post = {
      id: `post_sched_${Date.now()}`,
      pageId: page.pageId,
      pageName: page.name,
      message: data.message,
      postType: data.postType,
      linkUrl: data.linkUrl,
      photoUrl: data.photoUrl,
      videoUrl: data.videoUrl,
      status: 'SCHEDULED',
      scheduledFor: data.scheduledTime,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      reachCount: 0,
      impressionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.savePost(post);

    const scheduledPost: ScheduledPost = {
      id: `sched_${Date.now()}`,
      postId: post.id,
      post,
      scheduledTime: data.scheduledTime,
      timezone: data.timezone || 'UTC',
      retryCount: 0,
      maxRetries: 3,
      status: 'QUEUED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.saveScheduledPost(scheduledPost);

    dbStore.logActivity({
      id: `act_${Date.now()}`,
      pageId: page.pageId,
      pageName: page.name,
      postId: post.id,
      actionType: 'POST_SCHEDULED',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      apiResponseStatus: 200,
      details: `Scheduled ${data.postType} post for ${data.scheduledTime} (${data.timezone || 'UTC'})`,
      retryCount: 0,
    });

    return { post, scheduledPost };
  }

  /**
   * Processes all queued posts whose scheduledTime has arrived.
   */
  static async processDuePosts() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();
      const allScheduled = dbStore.getScheduledPosts();
      const due = allScheduled.filter(
        (s) => s.status === 'QUEUED' && new Date(s.scheduledTime) <= now
      );

      for (const item of due) {
        await this.executeScheduledPost(item);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Executes a scheduled post with exponential backoff retry.
   */
  static async executeScheduledPost(item: ScheduledPost) {
    const post = dbStore.getPost(item.postId);
    if (!post) {
      item.status = 'FAILED';
      item.lastError = 'Associated post record missing.';
      dbStore.saveScheduledPost(item);
      return;
    }

    item.status = 'PROCESSING';
    dbStore.saveScheduledPost(item);

    try {
      const published = await MetaPostService.publishPost(post.pageId, {
        message: post.message,
        postType: post.postType,
        linkUrl: post.linkUrl,
        photoUrl: post.photoUrl,
        videoUrl: post.videoUrl,
      });

      item.status = 'COMPLETED';
      post.status = 'PUBLISHED';
      post.postId = published.postId;
      post.publishedAt = new Date().toISOString();
      post.permalink = published.permalink;

      dbStore.savePost(post);
      dbStore.saveScheduledPost(item);

      const page = dbStore.getPage(post.pageId);
      if (page) {
        dbStore.addNotification({
          id: `notif_${Date.now()}`,
          userId: page.userId,
          type: 'SUCCESS',
          title: 'Scheduled Post Published',
          message: `Your scheduled post on ${page.name} was successfully published via official Meta API.`,
          read: false,
          actionUrl: '/posts',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      item.retryCount += 1;
      item.lastError = err.message;

      if (item.retryCount >= item.maxRetries) {
        item.status = 'FAILED';
        post.status = 'FAILED';
        post.errorMessage = `Failed after ${item.retryCount} attempts: ${err.message}`;
      } else {
        item.status = 'QUEUED';
        // Exponential backoff: retry in 2^retryCount minutes
        const backoffMinutes = Math.pow(2, item.retryCount);
        item.scheduledTime = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();
      }

      dbStore.savePost(post);
      dbStore.saveScheduledPost(item);
    }
  }

  /**
   * Retries a failed scheduled post immediately.
   */
  static async retryScheduledPost(id: string) {
    const item = dbStore.getScheduledPost(id);
    if (!item) throw new Error('Scheduled post not found.');

    item.retryCount = 0;
    item.status = 'QUEUED';
    item.scheduledTime = new Date().toISOString();
    dbStore.saveScheduledPost(item);

    await this.executeScheduledPost(item);
    return dbStore.getScheduledPost(id);
  }

  /**
   * Cancels a scheduled post.
   */
  static cancelScheduledPost(id: string) {
    dbStore.cancelScheduledPost(id);
    return dbStore.getScheduledPost(id);
  }
}

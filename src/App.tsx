/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { api, AuthStatusResponse } from './api';
import {
  FacebookPage,
  Post,
  ScheduledPost,
  Comment,
  CommentTemplate,
  AutomationRule,
  AutomationExecution,
  ModerationRule,
  ActivityLog,
  PostType,
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { PostCreatorModal } from './components/PostCreatorModal';
import { TokenDebuggerModal } from './components/TokenDebuggerModal';
import { WebhookSimulatorModal } from './components/WebhookSimulatorModal';

import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { PagesView } from './views/PagesView';
import { PostsView } from './views/PostsView';
import { ScheduledView } from './views/ScheduledView';
import { CommentsView } from './views/CommentsView';
import { AutomationsView } from './views/AutomationsView';
import { TemplatesView } from './views/TemplatesView';
import { ModerationView } from './views/ModerationView';
import { ReactionsView } from './views/ReactionsView';
import { AnalyticsView } from './views/AnalyticsView';
import { ActivityView } from './views/ActivityView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Entities
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [activePage, setActivePage] = useState<FacebookPage | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [templates, setTemplates] = useState<CommentTemplate[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [moderationRules, setModerationRules] = useState<ModerationRule[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Modals
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [tokenDebuggerOpen, setTokenDebuggerOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Synchronize dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load all app data
  const loadAppData = useCallback(async () => {
    try {
      const status = await api.getAuthStatus();
      setAuthStatus(status);

      if (!status.isConnected) {
        setPages([]);
        setActivePage(undefined);
        setPosts([]);
        setScheduledPosts([]);
        setComments([]);
        setTemplates([]);
        setRules([]);
        setExecutions([]);
        setModerationRules([]);
        setActivityLogs([]);
        return;
      }

      const [pagesRes, postsRes, schedRes, cmtRes, tmplRes, autoRes, modRes, actRes] =
        await Promise.all([
          api.getPages(),
          api.getPosts(),
          api.getScheduledPosts(),
          api.getComments(),
          api.getTemplates(),
          api.getAutomations(),
          api.getModerationRules(),
          api.getActivityLogs(),
        ]);

      setPages(pagesRes.pages || []);
      const currentActive =
        pagesRes.pages?.find((p) => p.isDefault && p.isConnected) ||
        pagesRes.pages?.[0] ||
        status.activePage;
      setActivePage(currentActive);

      setPosts(postsRes.posts || []);
      setScheduledPosts(schedRes.scheduled || []);
      setComments(cmtRes.comments || []);
      setTemplates(tmplRes.templates || []);
      setRules(autoRes.rules || []);
      setExecutions(autoRes.executions || []);
      setModerationRules(modRes.rules || []);
      setActivityLogs(actRes.logs || []);
    } catch (err) {
      console.error('Failed to load PagePilot application data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppData();

    // Listen for OAuth Popup callback message
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        loadAppData();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loadAppData]);

  // Connect Facebook handler using OAuth Popup
  const handleConnectFacebook = async () => {
    try {
      setIsConnecting(true);
      await api.startOAuthPopup();
      await loadAppData();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.disconnectFacebook();
    } catch (err) {
      console.error('Failed to disconnect Facebook:', err);
    }

    // Clear all client cache in localStorage and sessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Storage clear error:', e);
    }

    // Reset local React state
    setPages([]);
    setActivePage(undefined);
    setPosts([]);
    setScheduledPosts([]);
    setComments([]);
    setTemplates([]);
    setRules([]);
    setExecutions([]);
    setModerationRules([]);
    setActivityLogs([]);
    setCurrentTab('dashboard');

    // Fetch fresh status from server (which has isConnected: false)
    try {
      const freshStatus = await api.getAuthStatus();
      setAuthStatus(freshStatus);
    } catch {
      setAuthStatus(null);
    }
  };

  const handleExploreDemo = async () => {
    try {
      setIsConnecting(true);
      await api.enterDemo();
      await loadAppData();
    } catch (err: any) {
      alert(err.message || 'Sandbox demo fallback is not enabled.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSelectPage = async (pageId: string) => {
    const updated = await api.selectPage(pageId);
    setActivePage(updated);
    loadAppData();
  };

  const handleTogglePageConnect = async (pageId: string, isConnected: boolean) => {
    await api.togglePageConnect(pageId, isConnected);
    loadAppData();
  };

  const handleSyncPages = async () => {
    try {
      setIsSyncing(true);
      await api.syncPages();
      await loadAppData();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreatePost = async (payload: {
    pageId: string;
    message: string;
    postType: PostType;
    linkUrl?: string;
    photoUrl?: string;
    videoUrl?: string;
    isScheduled?: boolean;
    scheduledTime?: string;
    timezone?: string;
  }) => {
    if (payload.isScheduled && payload.scheduledTime) {
      await api.schedulePost({
        pageId: payload.pageId,
        message: payload.message,
        postType: payload.postType,
        linkUrl: payload.linkUrl,
        photoUrl: payload.photoUrl,
        videoUrl: payload.videoUrl,
        scheduledTime: payload.scheduledTime,
        timezone: payload.timezone,
      });
    } else {
      await api.createPost({
        pageId: payload.pageId,
        message: payload.message,
        postType: payload.postType,
        linkUrl: payload.linkUrl,
        photoUrl: payload.photoUrl,
        videoUrl: payload.videoUrl,
      });
    }
    await loadAppData();
  };

  const handleDeletePost = async (id: string) => {
    await api.deletePost(id);
    await loadAppData();
  };

  const handleCancelScheduledPost = async (id: string) => {
    await api.cancelScheduledPost(id);
    await loadAppData();
  };

  const handleRetryScheduledPost = async (id: string) => {
    await api.retryScheduledPost(id);
    await loadAppData();
  };

  const handleReplyComment = async (commentId: string, message: string) => {
    await api.replyComment(commentId, message);
    await loadAppData();
  };

  const handleToggleHideComment = async (commentId: string, isHidden: boolean) => {
    await api.toggleHideComment(commentId, isHidden);
    await loadAppData();
  };

  const handleDeleteComment = async (commentId: string) => {
    await api.deleteComment(commentId);
    await loadAppData();
  };

  const handleSaveTemplate = async (tmpl: Partial<CommentTemplate>) => {
    await api.saveTemplate(tmpl);
    await loadAppData();
  };

  const handleDeleteTemplate = async (id: string) => {
    await api.deleteTemplate(id);
    await loadAppData();
  };

  const handleSaveRule = async (rule: Partial<AutomationRule>) => {
    await api.saveAutomation(rule);
    await loadAppData();
  };

  const handleToggleRule = async (id: string) => {
    await api.toggleAutomation(id);
    await loadAppData();
  };

  const handleDeleteRule = async (id: string) => {
    await api.deleteAutomation(id);
    await loadAppData();
  };

  const handleSaveModerationRule = async (rule: Partial<ModerationRule>) => {
    await api.saveModerationRule(rule);
    await loadAppData();
  };

  const handleDeleteModerationRule = async (id: string) => {
    await api.deleteModerationRule(id);
    await loadAppData();
  };

  const handleUpdateSettings = async (partial: any) => {
    await api.updateSettings(partial);
    await loadAppData();
  };

  const handleResetSeed = async () => {
    await api.resetSeed();
    await loadAppData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-semibold tracking-wide">
          Initializing PagePilot Suite (Graph API v21.0)...
        </div>
      </div>
    );
  }

  // If user has disconnected or not connected yet, show Landing & Facebook Login view
  if (!authStatus?.isConnected) {
    return (
      <LandingView
        onConnectFacebook={handleConnectFacebook}
        onExploreDemo={handleExploreDemo}
        isConnecting={isConnecting}
        sandboxFallbackAllowed={!!authStatus?.sandboxFallbackAllowed}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        commentsCount={comments.filter((c) => !c.replyCommentId && !c.isHidden).length}
        scheduledCount={scheduledPosts.filter((s) => s.status === 'QUEUED').length}
        automationsCount={rules.filter((r) => r.isEnabled).length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          pages={pages}
          activePage={activePage}
          onSelectPage={handleSelectPage}
          connection={authStatus.connection}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenTokenDebugger={() => setTokenDebuggerOpen(true)}
          onOpenSimulator={() => setSimulatorOpen(true)}
          onDisconnect={handleDisconnect}
          onSyncPages={handleSyncPages}
          isSyncing={isSyncing}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              activePage={activePage}
              pages={pages}
              posts={posts}
              scheduledPosts={scheduledPosts}
              comments={comments}
              executions={executions}
              activityLogs={activityLogs}
              connection={authStatus.connection}
              onNavigate={setCurrentTab}
              onOpenCreatePost={() => setCreatePostOpen(true)}
              onOpenSimulator={() => setSimulatorOpen(true)}
              onReplyComment={handleReplyComment}
            />
          )}

          {currentTab === 'pages' && (
            <PagesView
              pages={pages}
              activePage={activePage}
              onSelectPage={handleSelectPage}
              onToggleConnect={handleTogglePageConnect}
              onSyncPages={handleSyncPages}
              isSyncing={isSyncing}
            />
          )}

          {currentTab === 'posts' && (
            <PostsView
              posts={posts}
              activePage={activePage}
              onOpenCreatePost={() => setCreatePostOpen(true)}
              onDeletePost={handleDeletePost}
            />
          )}

          {currentTab === 'scheduled' && (
            <ScheduledView
              scheduledPosts={scheduledPosts}
              activePage={activePage}
              onOpenCreatePost={() => setCreatePostOpen(true)}
              onCancelPost={handleCancelScheduledPost}
              onRetryPost={handleRetryScheduledPost}
            />
          )}

          {currentTab === 'comments' && (
            <CommentsView
              comments={comments}
              templates={templates}
              activePage={activePage}
              onReplyComment={handleReplyComment}
              onToggleHideComment={handleToggleHideComment}
              onDeleteComment={handleDeleteComment}
            />
          )}

          {currentTab === 'automations' && (
            <AutomationsView
              rules={rules}
              executions={executions}
              templates={templates}
              activePage={activePage}
              onSaveRule={handleSaveRule}
              onToggleRule={handleToggleRule}
              onDeleteRule={handleDeleteRule}
            />
          )}

          {currentTab === 'templates' && (
            <TemplatesView
              templates={templates}
              activePage={activePage}
              onSaveTemplate={handleSaveTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          )}

          {currentTab === 'moderation' && (
            <ModerationView
              rules={moderationRules}
              activePage={activePage}
              onSaveRule={handleSaveModerationRule}
              onDeleteRule={handleDeleteModerationRule}
            />
          )}

          {currentTab === 'reactions' && (
            <ReactionsView activePage={activePage} />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView activePage={activePage} />
          )}

          {currentTab === 'activity' && (
            <ActivityView
              activityLogs={activityLogs}
              activePage={activePage}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={authStatus.settings}
              connection={authStatus.connection}
              onUpdateSettings={handleUpdateSettings}
              onDisconnect={handleDisconnect}
              onResetSeed={handleResetSeed}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {activePage && (
        <PostCreatorModal
          page={activePage}
          isOpen={createPostOpen}
          onClose={() => setCreatePostOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}

      <TokenDebuggerModal
        isOpen={tokenDebuggerOpen}
        onClose={() => setTokenDebuggerOpen(false)}
      />

      <WebhookSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        pages={pages}
        activePage={activePage}
        onRefreshData={loadAppData}
      />
    </div>
  );
}

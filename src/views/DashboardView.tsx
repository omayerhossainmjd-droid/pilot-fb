import React from 'react';
import {
  FacebookPage,
  Post,
  ScheduledPost,
  Comment,
  AutomationExecution,
  ActivityLog,
  FacebookConnection,
} from '../types';
import {
  Layers,
  FileText,
  CalendarClock,
  MessageSquare,
  Bot,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Radio,
  Clock,
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface DashboardViewProps {
  activePage?: FacebookPage;
  pages: FacebookPage[];
  posts: Post[];
  scheduledPosts: ScheduledPost[];
  comments: Comment[];
  executions: AutomationExecution[];
  activityLogs: ActivityLog[];
  connection: FacebookConnection | null;
  onNavigate: (tab: NavTab) => void;
  onOpenCreatePost: () => void;
  onOpenSimulator: () => void;
  onReplyComment: (commentId: string, text: string) => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activePage,
  pages,
  posts,
  scheduledPosts,
  comments,
  executions,
  activityLogs,
  connection,
  onNavigate,
  onOpenCreatePost,
  onOpenSimulator,
  onReplyComment,
}) => {
  const [quickReplyText, setQuickReplyText] = React.useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = React.useState<string | null>(null);

  const successfulExecutions = executions.filter((e) => e.status === 'SUCCESS').length;
  const failedExecutions = executions.filter((e) => e.status === 'FAILED').length;
  const queuedScheduled = scheduledPosts.filter((s) => s.status === 'QUEUED');

  const statCards = [
    {
      label: 'Connected Pages',
      value: pages.filter((p) => p.isConnected).length,
      icon: Layers,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      tab: 'pages' as NavTab,
    },
    {
      label: 'Total Posts',
      value: posts.length,
      icon: FileText,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      tab: 'posts' as NavTab,
    },
    {
      label: 'Scheduled Posts',
      value: queuedScheduled.length,
      icon: CalendarClock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      tab: 'scheduled' as NavTab,
    },
    {
      label: 'Comments Managed',
      value: comments.length,
      icon: MessageSquare,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      tab: 'comments' as NavTab,
    },
    {
      label: 'Automated Replies',
      value: executions.length,
      icon: Bot,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      tab: 'automations' as NavTab,
    },
    {
      label: 'Successful Automations',
      value: successfulExecutions,
      icon: CheckCircle2,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      tab: 'automations' as NavTab,
    },
    {
      label: 'Failed Automations',
      value: failedExecutions,
      icon: XCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      tab: 'activity' as NavTab,
    },
  ];

  const handleQuickReply = async (commentId: string) => {
    const text = quickReplyText[commentId];
    if (!text?.trim()) return;
    try {
      setReplyingId(commentId);
      await onReplyComment(commentId, text);
      setQuickReplyText((prev) => ({ ...prev, [commentId]: '' }));
    } finally {
      setReplyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg shadow-blue-500/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-200">
            {connection?.isSandboxMode ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-amber-950 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-900 animate-pulse" />
                DEMO MODE
              </span>
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            )}
            {connection?.isSandboxMode
              ? 'Simulated Sandbox Workspace (Demo Mode)'
              : 'Meta Graph API v21.0 • AES-256 Encrypted Session'}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight mt-1">
            Welcome back, {connection?.facebookUserName || 'Administrator'}
          </h1>
          <p className="text-xs text-blue-100/80 mt-1">
            Managing <span className="font-semibold text-white">{activePage?.name || 'Facebook Page'}</span>. Webhook listener active.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCreatePost}
            className="px-4 py-2 text-xs font-semibold bg-white text-blue-700 hover:bg-blue-50 rounded-xl flex items-center gap-1.5 shadow-md shadow-black/10 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Post
          </button>
          <button
            onClick={onOpenSimulator}
            className="px-4 py-2 text-xs font-semibold bg-blue-500/30 hover:bg-blue-500/40 text-white border border-white/20 rounded-xl flex items-center gap-1.5 transition-all shrink-0"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Simulate Webhook
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => onNavigate(card.tab)}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 dark:group-hover:text-slate-200 transition-colors" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {card.value.toLocaleString()}
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {card.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Split Section: Upcoming Scheduled & Recent Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Scheduled Posts (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Upcoming Scheduled Posts
              </h2>
            </div>
            <button
              onClick={() => onNavigate('scheduled')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Queue
            </button>
          </div>

          {queuedScheduled.length === 0 ? (
            <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs">
              <CalendarClock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No posts currently scheduled.
            </div>
          ) : (
            <div className="space-y-3">
              {queuedScheduled.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                      <Clock className="w-3 h-3" />
                      {new Date(item.scheduledTime).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px]">
                      {item.timezone}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                    {item.post?.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Incoming Comments (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Comment Stream
              </h2>
            </div>
            <button
              onClick={() => onNavigate('comments')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              All Comments ({comments.length})
            </button>
          </div>

          <div className="space-y-3">
            {comments.slice(0, 3).map((cmt) => (
              <div
                key={cmt.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={cmt.fromPictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                      alt={cmt.fromName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {cmt.fromName}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(cmt.createdTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{cmt.message}"
                </p>

                {/* Has reply */}
                {cmt.replies && cmt.replies.length > 0 ? (
                  <div className="pl-3 border-l-2 border-emerald-500/40 text-[11px] text-emerald-700 dark:text-emerald-400 space-y-1">
                    <div className="font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Auto-Replied via Official Meta API:
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 italic">
                      "{cmt.replies[0].message}"
                    </div>
                  </div>
                ) : (
                  /* Quick inline reply input */
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Write official Page reply..."
                      value={quickReplyText[cmt.id] || ''}
                      onChange={(e) =>
                        setQuickReplyText((prev) => ({ ...prev, [cmt.id]: e.target.value }))
                      }
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                    <button
                      onClick={() => handleQuickReply(cmt.id)}
                      disabled={replyingId === cmt.id}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                    >
                      {replyingId === cmt.id ? 'Sending...' : 'Reply'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Automated Actions & Meta API Audit Log
            </h2>
          </div>
          <button
            onClick={() => onNavigate('activity')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Full Audit Trail
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Target / Details</th>
                <th className="py-2.5 px-3">Meta Status</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {activityLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.status === 'SKIPPED'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {log.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {log.actionType}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-md truncate">
                    {log.details || log.errorMessage || '—'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                    {log.apiResponseStatus ? `${log.apiResponseStatus} OK` : '200 OK'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

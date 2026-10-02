import React, { useState } from 'react';
import { ScheduledPost, FacebookPage } from '../types';
import {
  CalendarClock,
  Clock,
  RotateCcw,
  Ban,
  Plus,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface ScheduledViewProps {
  scheduledPosts: ScheduledPost[];
  activePage?: FacebookPage;
  onOpenCreatePost: () => void;
  onCancelPost: (id: string) => Promise<void>;
  onRetryPost: (id: string) => Promise<void>;
}

export const ScheduledView: React.FC<ScheduledViewProps> = ({
  scheduledPosts,
  activePage,
  onOpenCreatePost,
  onCancelPost,
  onRetryPost,
}) => {
  const [actingId, setActingId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this scheduled post?')) return;
    try {
      setActingId(id);
      await onCancelPost(id);
    } finally {
      setActingId(null);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      setActingId(id);
      await onRetryPost(id);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Scheduled Posts Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Background queue worker with automated retries and timezone support for{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {activePage?.name || 'Facebook Page'}
            </span>
          </p>
        </div>

        <button
          onClick={onOpenCreatePost}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 shadow-sm shadow-blue-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Post</span>
        </button>
      </div>

      {/* Queue List */}
      {scheduledPosts.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-3">
          <CalendarClock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No scheduled posts in queue
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Plan your Page content in advance. Background workers will publish strictly via official Meta endpoints.
          </p>
          <button
            onClick={onOpenCreatePost}
            className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded-xl hover:bg-blue-100"
          >
            Schedule a Post
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledPosts.map((item) => {
            const isDue = new Date(item.scheduledTime) <= new Date();
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        item.status === 'QUEUED'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : item.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : item.status === 'PROCESSING'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {item.status}
                    </span>

                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {new Date(item.scheduledTime).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      ({item.timezone})
                    </span>

                    {item.retryCount > 0 && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                        Retry {item.retryCount}/{item.maxRetries}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-2 leading-relaxed">
                    {item.post?.message}
                  </p>

                  {item.lastError && (
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {item.lastError}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  {item.status === 'FAILED' && (
                    <button
                      onClick={() => handleRetry(item.id)}
                      disabled={actingId === item.id}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retry Now
                    </button>
                  )}

                  {item.status === 'QUEUED' && (
                    <button
                      onClick={() => handleCancel(item.id)}
                      disabled={actingId === item.id}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  )}

                  {item.status === 'COMPLETED' && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Published
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Comment, CommentTemplate, FacebookPage } from '../types';
import {
  MessageSquare,
  Search,
  EyeOff,
  Eye,
  Trash2,
  Send,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface CommentsViewProps {
  comments: Comment[];
  templates: CommentTemplate[];
  activePage?: FacebookPage;
  onReplyComment: (commentId: string, message: string) => Promise<void>;
  onToggleHideComment: (commentId: string, isHidden: boolean) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export const CommentsView: React.FC<CommentsViewProps> = ({
  comments,
  templates,
  activePage,
  onReplyComment,
  onToggleHideComment,
  onDeleteComment,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UNPROCESSED' | 'REPLIED' | 'HIDDEN'>('ALL');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [selectedTemplateMap, setSelectedTemplateMap] = useState<Record<string, string>>({});
  const [actingId, setActingId] = useState<string | null>(null);

  const filteredComments = comments.filter((c) => {
    const matchesSearch =
      c.message.toLowerCase().includes(search.toLowerCase()) ||
      c.fromName.toLowerCase().includes(search.toLowerCase());

    if (filter === 'UNPROCESSED') return matchesSearch && !c.replyCommentId && !c.isHidden;
    if (filter === 'REPLIED') return matchesSearch && (!!c.replyCommentId || (c.replies && c.replies.length > 0));
    if (filter === 'HIDDEN') return matchesSearch && c.isHidden;
    return matchesSearch;
  });

  const handleSendReply = async (commentId: string) => {
    const text = replyTextMap[commentId];
    if (!text?.trim()) return;

    try {
      setActingId(commentId);
      await onReplyComment(commentId, text);
      setReplyTextMap((prev) => ({ ...prev, [commentId]: '' }));
    } finally {
      setActingId(null);
    }
  };

  const handleApplyTemplate = (commentId: string, templateId: string) => {
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl) {
      setSelectedTemplateMap((prev) => ({ ...prev, [commentId]: templateId }));
      setReplyTextMap((prev) => ({ ...prev, [commentId]: tmpl.replyText }));
    }
  };

  const handleToggleHide = async (commentId: string, currentHidden: boolean) => {
    try {
      setActingId(commentId);
      await onToggleHideComment(commentId, !currentHidden);
    } finally {
      setActingId(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment via official Meta API?')) return;
    try {
      setActingId(commentId);
      await onDeleteComment(commentId);
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
            <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Comments & Engagement Feed
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official Graph API v21.0 comment monitoring, inline replies, and visibility moderation for{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {activePage?.name || 'Facebook Page'}
            </span>
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search comments by commenter name or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
          {(['ALL', 'UNPROCESSED', 'REPLIED', 'HIDDEN'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === tab
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-3">
          <MessageSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No comments found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All caught up! Incoming Facebook Page comments will appear here automatically via webhooks.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((cmt) => (
            <div
              key={cmt.id}
              className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs space-y-4 transition-all ${
                cmt.isHidden
                  ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={cmt.fromPictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                    alt={cmt.fromName}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {cmt.fromName}
                      </span>
                      {cmt.isHidden && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          Hidden on Facebook
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Comment ID: {cmt.commentId} • {new Date(cmt.createdTime).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleHide(cmt.id, cmt.isHidden)}
                    disabled={actingId === cmt.id}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                      cmt.isHidden
                        ? 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={cmt.isHidden ? 'Unhide comment' : 'Hide comment on Facebook'}
                  >
                    {cmt.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{cmt.isHidden ? 'Unhide' : 'Hide'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(cmt.id)}
                    disabled={actingId === cmt.id}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title="Delete comment permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Comment Text */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                "{cmt.message}"
              </div>

              {/* Existing Replies Stream */}
              {cmt.replies && cmt.replies.length > 0 && (
                <div className="pl-4 border-l-2 border-emerald-500/40 space-y-2">
                  {cmt.replies.map((rep) => (
                    <div key={rep.id} className="text-xs space-y-1">
                      <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Official Page Reply by {rep.fromName}
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 italic bg-emerald-50/40 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                        "{rep.message}"
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form & Template Dropdown */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  {templates.length > 0 && (
                    <div className="relative sm:w-56 shrink-0">
                      <select
                        value={selectedTemplateMap[cmt.id] || ''}
                        onChange={(e) => handleApplyTemplate(cmt.id, e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      >
                        <option value="">Choose Template...</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Write an official response via Meta Graph API POST /{comment-id}/comments..."
                      value={replyTextMap[cmt.id] || ''}
                      onChange={(e) =>
                        setReplyTextMap((prev) => ({ ...prev, [cmt.id]: e.target.value }))
                      }
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handleSendReply(cmt.id)}
                      disabled={actingId === cmt.id || !replyTextMap[cmt.id]?.trim()}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 disabled:opacity-50 transition-all shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{actingId === cmt.id ? 'Sending...' : 'Reply'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

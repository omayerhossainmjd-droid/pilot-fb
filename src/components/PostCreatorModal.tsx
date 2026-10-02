import React, { useState } from 'react';
import { FacebookPage, PostType } from '../types';
import {
  X,
  Send,
  Calendar,
  Image as ImageIcon,
  Link2,
  Video,
  FileText,
  ThumbsUp,
  MessageCircle,
  Share2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface PostCreatorModalProps {
  page: FacebookPage;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    pageId: string;
    message: string;
    postType: PostType;
    linkUrl?: string;
    photoUrl?: string;
    videoUrl?: string;
    isScheduled?: boolean;
    scheduledTime?: string;
    timezone?: string;
  }) => Promise<void>;
}

export const PostCreatorModal: React.FC<PostCreatorModalProps> = ({
  page,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [postType, setPostType] = useState<PostType>('TEXT');
  const [message, setMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Post message content is required.');
      return;
    }

    let fullScheduledIso: string | undefined;
    if (isScheduled) {
      if (!scheduledDate || !scheduledTime) {
        setError('Please select both scheduled date and time.');
        return;
      }
      const combined = new Date(`${scheduledDate}T${scheduledTime}`);
      if (isNaN(combined.getTime()) || combined <= new Date()) {
        setError('Scheduled time must be in the future.');
        return;
      }
      fullScheduledIso = combined.toISOString();
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({
        pageId: page.pageId,
        message,
        postType,
        linkUrl: postType === 'LINK' ? linkUrl : undefined,
        photoUrl: postType === 'PHOTO' ? photoUrl : undefined,
        videoUrl: postType === 'VIDEO' ? videoUrl : undefined,
        isScheduled,
        scheduledTime: fullScheduledIso,
        timezone,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={page.pictureUrl} alt={page.name} className="w-8 h-8 rounded-full object-cover" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                Create Facebook Page Post
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Publishing to <span className="font-semibold text-blue-600 dark:text-blue-400">{page.name}</span> via official Meta API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Split Form & FB Live Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left Column: Form Controls */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Post Format Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Supported Post Format
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { type: 'TEXT' as PostType, label: 'Text', icon: FileText },
                  { type: 'PHOTO' as PostType, label: 'Photo', icon: ImageIcon },
                  { type: 'LINK' as PostType, label: 'Link', icon: Link2 },
                  { type: 'VIDEO' as PostType, label: 'Video', icon: Video },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = postType === item.type;
                  return (
                    <button
                      type="button"
                      key={item.type}
                      onClick={() => setPostType(item.type)}
                      className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                        active
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post Message */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Message Content
                </label>
                <span className="text-[11px] text-slate-400">{message.length} chars</span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's happening on your Facebook Page today? Share announcements, questions, or updates..."
                rows={5}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>

            {/* Format specific inputs */}
            {postType === 'PHOTO' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or public image URL"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {postType === 'LINK' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Link URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {postType === 'VIDEO' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Video File URL (MP4 / WebM)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://commondatastorage.googleapis.com/... or hosted video URL"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Publishing Time: Immediate vs Scheduled */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Schedule for Later
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {isScheduled && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Publication Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Timezone
                    </label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {isScheduled ? (
                  <>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Scheduling...' : 'Queue Scheduled Post'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Publishing...' : 'Publish to Page Feed'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Right Column: Facebook Live Preview Card */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Meta Feed Preview
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden flex flex-col">
              {/* FB Post Header */}
              <div className="p-4 flex items-center gap-3">
                <img
                  src={page.pictureUrl}
                  alt={page.name}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white text-xs leading-tight">
                    {page.name}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span>Just now</span>
                    <span>•</span>
                    <span>🌍 Public</span>
                  </div>
                </div>
              </div>

              {/* FB Post Text */}
              <div className="px-4 pb-3 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap min-h-12 leading-relaxed">
                {message || <span className="text-slate-400 italic">Your post content will appear here...</span>}
              </div>

              {/* Media Preview */}
              {postType === 'PHOTO' && photoUrl && (
                <div className="bg-slate-100 dark:bg-slate-800 max-h-60 overflow-hidden flex items-center justify-center">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-full object-cover max-h-60"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                  />
                </div>
              )}

              {postType === 'LINK' && linkUrl && (
                <div className="border-t border-b border-slate-100 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800/40">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">EXTERNAL LINK</div>
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate mt-0.5">
                    {linkUrl}
                  </div>
                </div>
              )}

              {/* FB Post Metrics Summary */}
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>0 Reactions</span>
                <span>0 Comments • 0 Shares</span>
              </div>

              {/* FB Action Bar */}
              <div className="px-2 py-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-slate-500 dark:text-slate-400 text-xs">
                <button type="button" className="flex items-center gap-1.5 py-1 px-3 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Like</span>
                </button>
                <button type="button" className="flex items-center gap-1.5 py-1 px-3 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Comment</span>
                </button>
                <button type="button" className="flex items-center gap-1.5 py-1 px-3 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

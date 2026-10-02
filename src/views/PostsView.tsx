import React, { useState } from 'react';
import { Post, FacebookPage } from '../types';
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  ThumbsUp,
  MessageCircle,
  Share2,
  Eye,
  Image as ImageIcon,
  Link2,
  Video,
} from 'lucide-react';

interface PostsViewProps {
  posts: Post[];
  activePage?: FacebookPage;
  onOpenCreatePost: () => void;
  onDeletePost: (id: string) => Promise<void>;
}

export const PostsView: React.FC<PostsViewProps> = ({
  posts,
  activePage,
  onOpenCreatePost,
  onDeletePost,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredPosts = posts.filter((p) => {
    const matchesSearch = p.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post from Facebook?')) return;
    try {
      setDeletingId(id);
      await onDeletePost(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Page Post Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish and manage eligible feed posts for{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {activePage?.name || 'Facebook Page'}
            </span>{' '}
            via official Graph API v21.0
          </p>
        </div>

        <button
          onClick={onOpenCreatePost}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 shadow-sm shadow-blue-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Post</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search posts by keywords or message content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
          {['ALL', 'PUBLISHED', 'SCHEDULED', 'DRAFT', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-3">
          <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No posts found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create your first post using the official Facebook Graph API publisher.
          </p>
          <button
            onClick={onOpenCreatePost}
            className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded-xl hover:bg-blue-100"
          >
            Create Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        post.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : post.status === 'SCHEDULED'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {post.status}
                    </span>

                    <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {post.postType === 'PHOTO' && <ImageIcon className="w-3 h-3 text-purple-500" />}
                      {post.postType === 'LINK' && <Link2 className="w-3 h-3 text-blue-500" />}
                      {post.postType === 'VIDEO' && <Video className="w-3 h-3 text-red-500" />}
                      {post.postType}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                      : new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Message */}
                <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {post.message}
                </p>

                {/* Media preview */}
                {post.photoUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden max-h-48 border border-slate-100 dark:border-slate-800">
                    <img
                      src={post.photoUrl}
                      alt="Post visual"
                      className="w-full object-cover max-h-48"
                    />
                  </div>
                )}

                {post.linkUrl && (
                  <div className="mt-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-blue-600 dark:text-blue-400 truncate">
                    🔗 {post.linkUrl}
                  </div>
                )}
              </div>

              {/* Engagement Metrics & Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px]" title="Likes / Reactions">
                    <ThumbsUp className="w-3 h-3 text-blue-500" />
                    {post.likeCount}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]" title="Comments">
                    <MessageCircle className="w-3 h-3 text-emerald-500" />
                    {post.commentCount}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]" title="Shares">
                    <Share2 className="w-3 h-3 text-indigo-500" />
                    {post.shareCount}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]" title="Impressions">
                    <Eye className="w-3 h-3 text-slate-400" />
                    {post.impressionsCount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {post.permalink && (
                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                      title="View post on Facebook"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-50"
                    title="Delete post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

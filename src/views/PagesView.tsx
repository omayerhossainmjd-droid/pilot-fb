import React from 'react';
import { FacebookPage } from '../types';
import {
  Layers,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Users,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Star,
} from 'lucide-react';

interface PagesViewProps {
  pages: FacebookPage[];
  activePage?: FacebookPage;
  onSelectPage: (pageId: string) => void;
  onToggleConnect: (pageId: string, isConnected: boolean) => void;
  onSyncPages: () => void;
  isSyncing: boolean;
}

export const PagesView: React.FC<PagesViewProps> = ({
  pages,
  activePage,
  onSelectPage,
  onToggleConnect,
  onSyncPages,
  isSyncing,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Connected Facebook Pages
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage Pages authorized under your Meta account via official endpoint{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-blue-600 dark:text-blue-400">
              GET /me/accounts
            </code>
          </p>
        </div>

        <button
          onClick={onSyncPages}
          disabled={isSyncing}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing with Meta...' : 'Sync Authorized Pages'}</span>
        </button>
      </div>

      {/* Pages Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pages.map((p) => {
          const isActive = p.pageId === activePage?.pageId;
          return (
            <div
              key={p.id}
              className={`p-6 rounded-2xl border transition-all ${
                isActive
                  ? 'border-blue-500/60 bg-blue-50/20 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={p.pictureUrl}
                    alt={p.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {p.name}
                      </h3>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          Active Workspace
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {p.category}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      Page ID: {p.pageId}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onToggleConnect(p.pageId, !p.isConnected)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title={p.isConnected ? 'Disconnect Page' : 'Connect Page'}
                >
                  {p.isConnected ? (
                    <ToggleRight className="w-7 h-7 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Stats & Tasks */}
              <div className="mt-5 grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-100 dark:border-slate-800/80 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>
                    <strong>{p.followersCount.toLocaleString()}</strong> Followers
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="truncate">
                    <strong>{p.tasks.length}</strong> Granted Tasks
                  </span>
                </div>
              </div>

              {/* Tasks Pills */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.tasks.map((task) => (
                  <span
                    key={task}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    {task}
                  </span>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="mt-5 pt-3 flex items-center justify-between">
                <a
                  href={`https://facebook.com/${p.pageId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View on Facebook
                </a>

                {!isActive && p.isConnected && (
                  <button
                    onClick={() => onSelectPage(p.pageId)}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Set as Active Page
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

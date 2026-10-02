import React, { useState } from 'react';
import { FacebookPage, FacebookConnection } from '../types';
import {
  ShieldCheck,
  ChevronDown,
  Moon,
  Sun,
  KeyRound,
  Radio,
  LogOut,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  pages: FacebookPage[];
  activePage?: FacebookPage;
  onSelectPage: (pageId: string) => void;
  connection: FacebookConnection | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenTokenDebugger: () => void;
  onOpenSimulator: () => void;
  onDisconnect: () => void;
  onSyncPages: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  pages,
  activePage,
  onSelectPage,
  connection,
  darkMode,
  onToggleDarkMode,
  onOpenTokenDebugger,
  onOpenSimulator,
  onDisconnect,
  onSyncPages,
  isSyncing,
}) => {
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between transition-colors">
      {/* Left: Active Facebook Page Switcher */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setPageDropdownOpen(!pageDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all"
          >
            {activePage?.pictureUrl ? (
              <img
                src={activePage.pictureUrl}
                alt={activePage.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500/30"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                P
              </div>
            )}
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 leading-tight">
                {activePage?.name || 'Select Page'}
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 inline shrink-0" />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {activePage ? `${activePage.followersCount.toLocaleString()} followers` : 'No Page active'}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>

          {/* Page Dropdown Menu */}
          {pageDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Authorized Facebook Pages</span>
                <button
                  onClick={onSyncPages}
                  disabled={isSyncing}
                  className="text-blue-500 hover:text-blue-600 flex items-center gap-1 normal-case text-xs font-normal"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto py-1">
                {pages.map((p) => {
                  const isSelected = p.pageId === activePage?.pageId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPage(p.pageId);
                        setPageDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 flex items-center gap-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <img
                        src={p.pictureUrl}
                        alt={p.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate flex items-center gap-1">
                          {p.name}
                          {isSelected && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.2 rounded text-blue-600 dark:text-blue-300">Active</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          ID: {p.pageId} • {p.followersCount.toLocaleString()} followers
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                <a
                  href="https://business.facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Meta Business Suite
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Official Meta Compliance Pill / DEMO MODE Badge */}
        {connection?.isSandboxMode ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 ring-1 ring-amber-500/20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>DEMO MODE</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Graph API v21.0 Only</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Simulate Live Comment Button */}
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
          title="Simulate incoming Facebook Webhook comment events"
        >
          <Radio className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
          <span className="hidden sm:inline">Webhook Simulator</span>
        </button>

        {/* Token Debugger Button */}
        <button
          onClick={onOpenTokenDebugger}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Inspect Meta Graph API Token & Permissions"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Token Auditor</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User / Disconnect profile */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-blue-500/20 shadow-sm">
              {connection?.facebookUserName
                ? connection.facebookUserName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                : 'AV'}
            </div>
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Connected Account
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                  {connection?.facebookUserName || 'Facebook User'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  ID: {connection?.facebookUserId || '—'}
                </div>
                <div className="mt-1.5">
                  {connection?.isSandboxMode ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      DEMO MODE
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded">
                      Meta Live Session Active
                    </span>
                  )}
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onDisconnect();
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect Facebook
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

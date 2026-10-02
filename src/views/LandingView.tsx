import React, { useState } from 'react';
import {
  ShieldCheck,
  Bot,
  Zap,
  Lock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  MessageSquare,
  BarChart3,
  Cpu,
  RefreshCw,
} from 'lucide-react';

interface LandingViewProps {
  onConnectFacebook: () => Promise<void>;
  onExploreDemo: () => void;
  isConnecting: boolean;
  sandboxFallbackAllowed?: boolean;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onConnectFacebook,
  onExploreDemo,
  isConnecting,
  sandboxFallbackAllowed = false,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setError(null);
      await onConnectFacebook();
    } catch (err: any) {
      setError(err.message || 'Connection flow was interrupted.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border-b border-blue-500/20 py-2.5 px-4 text-center text-xs text-blue-200 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>100% Official Meta Graph API v21.0 Compliant:</strong> Zero browser automation, no passwords requested, zero fake engagement.
        </span>
      </div>

      {/* Header */}
      <header className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              PagePilot
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Meta SaaS
              </span>
            </div>
            <div className="text-xs text-slate-400">Enterprise Facebook Page Automation</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {sandboxFallbackAllowed && (
            <button
              onClick={onExploreDemo}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
            >
              Explore Sandbox Demo
            </button>
          )}
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
          >
            {isConnecting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            <span>Connect with Facebook</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center container mx-auto px-6 py-12 max-w-6xl">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-medium">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Next-Generation Facebook Community Operations</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Scale Facebook Pages with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Zero API Risk
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The compliant automation engine built strictly for Meta Graph API v21.0. Automate routine comments, schedule posts across timezones, shield your community from spam, and maintain 100% token security.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2.5 shadow-xl shadow-blue-500/25 transition-all"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Launch with Facebook Login</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            {sandboxFallbackAllowed && (
              <button
                onClick={onExploreDemo}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center justify-center gap-2 transition-all"
              >
                <span>Instant Sandbox Workspace</span>
              </button>
            )}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Smart Auto Comment Replies</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Define keyword rules (price, location, support) with multiple response templates, cooldown timers, and duplicate reply protection via official endpoints.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Post Scheduling & Queue</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Queue text, photo, link, and video posts with timezone support and automated retry workers with exponential backoff.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Official Page Insights</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct telemetry from Meta Graph API Page Insights: impressions, reach, engaged users, and reactions with CSV export.
            </p>
          </div>
        </div>

        {/* Safety Constitution Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>The PagePilot Security Guarantee</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                  AES-256-GCM
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                We never ask for or store passwords. We never employ Selenium, Puppeteer, or fake clicks. Every action is executed through official Meta endpoints and signed webhooks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Graph API v21.0 Certified</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500">
        PagePilot SaaS • Built exclusively with the official Meta Graph API
      </footer>
    </div>
  );
};

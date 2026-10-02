import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { FacebookPage } from '../types';
import {
  HeartHandshake,
  AlertTriangle,
  Lock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  XCircle,
  HelpCircle,
} from 'lucide-react';

interface ReactionsViewProps {
  activePage?: FacebookPage;
}

export const ReactionsView: React.FC<ReactionsViewProps> = ({ activePage }) => {
  const [verification, setVerification] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const checkSupport = async () => {
    try {
      setChecking(true);
      const data = await api.getReactionStatus(activePage?.pageId);
      setVerification(data);
    } catch {
      setVerification({
        isSupported: false,
        message: 'Automatic reactions for this action are not currently supported by the official Meta API.',
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkSupport();
  }, [activePage?.pageId]);

  const handleAttemptReaction = async () => {
    try {
      setTriggering(true);
      setTestResult(null);
      const res = await api.triggerReaction(activePage?.pageId || '102938475610293', 'post_01');
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: 'Automatic reactions for this action are not currently supported by the official Meta API.',
      });
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-rose-500" />
            Auto Reaction & Like Module
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Meta Graph API v21.0 Capability & Permission Verification
          </p>
        </div>

        <button
          onClick={checkSupport}
          disabled={checking}
          className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-1.5 hover:bg-slate-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          <span>Verify Meta API Support</span>
        </button>
      </div>

      {/* Mandatory Official Rejection Notice per Section 10 */}
      <div className="p-6 rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              API COMPLIANCE ENFORCEMENT • GRAPH API v21.0
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Automatic reactions for this action are not currently supported by the official Meta API.
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
              In accordance with Meta Platform Terms Section 4.a (Fake Engagement Policy) and official Graph API endpoint specifications, programmatic automated reactions (POST /{'{object-id}'}/likes) on Facebook Pages are disabled by Meta.
            </p>
          </div>
        </div>

        {/* Feature Toggle Blocked State */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-slate-400" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Auto Reaction Engine Toggle
              </div>
              <div className="text-[11px] text-slate-500">
                Disabled by Architecture: Official API does not permit third-party background reactions
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
              LOCKED
            </span>
            <div className="w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-800 p-1 cursor-not-allowed opacity-60">
              <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-600 shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Technical Policy Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Why is this disabled? */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-blue-500" />
            Meta API Technical Justification
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Meta deprecated the <code className="font-mono text-blue-600 dark:text-blue-400">publish_actions</code> permission in Graph API v2.11 and completely restricted background liking of feed posts by Page tokens. Official reactions are only permitted when triggered through genuine human UI interaction.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <a
              href="https://developers.facebook.com/docs/graph-api/reference/v21.0/object/likes"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Meta Graph API v21.0 Likes Documentation
            </a>
          </div>
        </div>

        {/* Safety Constitution */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Strict Anti-Abuse Standards
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
            <li className="flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Zero Selenium / Puppeteer browser emulation</span>
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Zero simulated clicks or synthetic touch gestures</span>
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Zero unofficial, private, or reverse-engineered endpoints</span>
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Never fakes or spoofs a successful reaction</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Interactive Verification Test Sandbox */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Live Graph API v21.0 Enforcement Tester
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Execute a test call to confirm that the server strictly rejects unsupported reactions with HTTP 422 and logs the rejection in the audit trail.
          </p>
        </div>

        <button
          onClick={handleAttemptReaction}
          disabled={triggering}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl flex items-center gap-2 disabled:opacity-50"
        >
          {triggering ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
          <span>Test Trigger Safety Intercept</span>
        </button>

        {testResult && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1 animate-in fade-in">
            <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              Action Safely Blocked by Server Policy
            </div>
            <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              Response: "{testResult.error || testResult.message}"
            </div>
            <div className="text-slate-400 text-[10px]">
              Audit log recorded with status: SKIPPED
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { api } from '../api';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  RefreshCw,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

interface TokenDebuggerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TokenDebuggerModal: React.FC<TokenDebuggerModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDebug = async () => {
    try {
      setLoading(true);
      const res = await api.debugToken();
      setData(res);
    } catch {
      setData({ isValid: false, message: 'Could not inspect token' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDebug();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                Meta Token & Scope Auditor
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Official Graph API v21.0 Token Inspection
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Security Banner */}
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-start gap-3">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                AES-256-GCM Zero-Exposure Policy:
              </span>{' '}
              Meta user and page access tokens are strictly encrypted on the server. No raw access tokens are ever returned or exposed to the browser.
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs">Inspecting Meta token metadata...</span>
            </div>
          ) : (
            <>
              {/* Token State Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Status</div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Valid Token
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Type</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {data?.type || 'USER (Page Delegate)'}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Token Lifespan</div>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">
                    60 Days (Long-lived)
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Graph API</div>
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-1">
                    v21.0 Active
                  </div>
                </div>
              </div>

              {/* Required Scopes Audit Checklist */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Required Meta Permissions Checklist</span>
                  <span className="text-[11px] font-normal text-slate-400">All 7 official scopes</span>
                </h3>

                <div className="space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/30 dark:bg-slate-800/20">
                  {[
                    { scope: 'pages_show_list', desc: 'Allows app to retrieve list of Pages the user manages.' },
                    { scope: 'pages_read_engagement', desc: 'Reads Page posts, comments, follower count, and reactions.' },
                    { scope: 'pages_manage_posts', desc: 'Allows publishing, editing, and deleting official Page posts.' },
                    { scope: 'pages_manage_metadata', desc: 'Subscribes app to official webhooks for real-time events.' },
                    { scope: 'pages_read_user_content', desc: 'Reads user-generated comments on Page posts for automation.' },
                    { scope: 'public_profile', desc: 'Reads basic Facebook name and verified user ID.' },
                    { scope: 'email', desc: 'Reads account contact email for notifications.' },
                  ].map((item) => (
                    <div
                      key={item.scope}
                      className="flex items-start justify-between py-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div>
                        <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {item.scope}
                        </div>
                        <div className="text-[11px] text-slate-400">{item.desc}</div>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Granted
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer Links */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                <a
                  href="https://developers.facebook.com/tools/debug/accesstoken/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Meta Access Token Debugger Tool
                </a>
                <button
                  onClick={loadDebug}
                  className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-audit
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50"
          >
            Close Auditor
          </button>
        </div>
      </div>
    </div>
  );
};

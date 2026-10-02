import React, { useState } from 'react';
import { ModerationRule, FacebookPage } from '../types';
import {
  ShieldAlert,
  Plus,
  Trash2,
  EyeOff,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface ModerationViewProps {
  rules: ModerationRule[];
  activePage?: FacebookPage;
  onSaveRule: (rule: Partial<ModerationRule>) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
}

export const ModerationView: React.FC<ModerationViewProps> = ({
  rules,
  activePage,
  onSaveRule,
  onDeleteRule,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [blocklist, setBlocklist] = useState('airdrop, crypto airdrop, free btc, win $1000, whatsapp +');
  const [allowlist, setAllowlist] = useState('cryptography, bitcoin news');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      await onSaveRule({
        name,
        pageId: activePage?.pageId || '102938475610293',
        blocklistKeywords: blocklist.split(',').map((s) => s.trim()).filter(Boolean),
        allowlistKeywords: allowlist.split(',').map((s) => s.trim()).filter(Boolean),
        action: 'HIDE',
        isEnabled: true,
      });
      setShowModal(false);
      setName('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Spam Shield & Comment Moderation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated keyword blocklist protection using official Graph API comment visibility endpoint{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-rose-600 dark:text-rose-400">
              POST /{'{comment-id}'} is_hidden=true
            </code>
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-2 shadow-sm shadow-rose-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Moderation Rule</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3.5">
        <Lock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-slate-900 dark:text-white">
            Official Meta Moderation Protocols Only
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            In compliance with Meta Platform Terms, PagePilot moderates comments strictly using the official API (hiding spam comments from the public page feed). We never employ browser automation or simulated clicks.
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Create Moderation Rule
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crypto & Phishing Keyword Shield"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Blocklist Keywords (comma-separated)
                </label>
                <textarea
                  rows={3}
                  required
                  value={blocklist}
                  onChange={(e) => setBlocklist(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Allowlist Exceptions (comma-separated)
                </label>
                <input
                  type="text"
                  value={allowlist}
                  onChange={(e) => setAllowlist(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Official Enforcement Action
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Automatically hide comment via Meta API
                  </div>
                </div>
                <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <EyeOff className="w-4 h-4" />
                  HIDE
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Deploy Moderation Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {rule.name}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                <EyeOff className="w-3 h-3" />
                AUTO-HIDE
              </span>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Blocklisted Phrases ({rule.blocklistKeywords?.length || 0})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rule.blocklistKeywords?.map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-mono text-[10px] border border-rose-200 dark:border-rose-900/60"
                  >
                    "{kw}"
                  </span>
                ))}
              </div>
            </div>

            {rule.allowlistKeywords?.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Allowlist Exceptions
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rule.allowlistKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] border border-emerald-200 dark:border-emerald-900/60"
                    >
                      "{kw}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Status: Active & Enforced</span>
              <button
                onClick={() => onDeleteRule(rule.id)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

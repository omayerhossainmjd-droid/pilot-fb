import React, { useState } from 'react';
import { FacebookPage } from '../types';
import { api } from '../api';
import {
  X,
  Radio,
  Send,
  Sparkles,
  Bot,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

interface WebhookSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: FacebookPage[];
  activePage?: FacebookPage;
  onRefreshData?: () => void;
}

export const WebhookSimulatorModal: React.FC<WebhookSimulatorModalProps> = ({
  isOpen,
  onClose,
  pages,
  activePage,
  onRefreshData,
}) => {
  const [selectedPageId, setSelectedPageId] = useState(activePage?.pageId || pages[0]?.pageId || '');
  const [commenterName, setCommenterName] = useState('Jessica Taylor');
  const [message, setMessage] = useState('Could you please tell me what the enterprise price is?');
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const presets = [
    {
      label: 'Pricing Inquiry',
      commenter: 'Jessica Taylor',
      text: 'Could you please tell me what the enterprise price is?',
      expected: 'Triggers Price Auto-Reply Template',
    },
    {
      label: 'Location Inquiry',
      commenter: 'Daniel Boone',
      text: 'Where is your official workshop location in the city?',
      expected: 'Triggers Location Auto-Reply Template',
    },
    {
      label: 'Crypto Spam Trigger',
      commenter: 'Bot 404',
      text: 'CLAIM FREE AIRDROP CRYPTO NOW AT http://spam-wallet.xyz WIN $5000',
      expected: 'Triggers Spam Moderation (Auto-Hide)',
    },
  ];

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSimulating(true);
      setResult(null);
      const res = await api.simulateWebhookComment({
        pageId: selectedPageId,
        postId: 'post_01',
        commenterName,
        message,
      });
      setResult(res);
      onRefreshData?.();
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                Meta Webhook Live Simulator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dispatch synthetic Facebook Page comment events directly to the automation engine
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Quick Test Scenarios
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setCommenterName(preset.commenter);
                    setMessage(preset.text);
                  }}
                  className="p-2.5 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-all text-xs"
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    {preset.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                    {preset.expected}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSimulate} className="space-y-4">
            {/* Target Page */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Facebook Page
              </label>
              <select
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {pages.map((p) => (
                  <option key={p.pageId} value={p.pageId}>
                    {p.name} ({p.pageId})
                  </option>
                ))}
              </select>
            </div>

            {/* Commenter Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Commenter Name
              </label>
              <input
                type="text"
                value={commenterName}
                onChange={(e) => setCommenterName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Comment Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Comment Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={simulating}
              className="w-full py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{simulating ? 'Emitting Webhook...' : 'Fire Webhook Comment Event'}</span>
            </button>
          </form>

          {/* Result Card */}
          {result && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs animate-in fade-in">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Webhook Processed Successfully
              </div>

              {result.automationResult?.moderated && (
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{result.automationResult.details}</span>
                </div>
              )}

              {result.automationResult?.automatedReply && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{result.automationResult.details}</span>
                </div>
              )}

              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-1">
                Event ID: {result.comment?.commentId} • Status: 200 OK
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

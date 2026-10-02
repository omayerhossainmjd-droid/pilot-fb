import React, { useState } from 'react';
import {
  AutomationRule,
  AutomationExecution,
  CommentTemplate,
  FacebookPage,
} from '../types';
import {
  Bot,
  Plus,
  Play,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Settings2,
  ShieldCheck,
} from 'lucide-react';

interface AutomationsViewProps {
  rules: AutomationRule[];
  executions: AutomationExecution[];
  templates: CommentTemplate[];
  activePage?: FacebookPage;
  onSaveRule: (rule: Partial<AutomationRule>) => Promise<void>;
  onToggleRule: (id: string) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
}

export const AutomationsView: React.FC<AutomationsViewProps> = ({
  rules,
  executions,
  templates,
  activePage,
  onSaveRule,
  onToggleRule,
  onDeleteRule,
}) => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<AutomationRule> | null>(null);
  const [ruleName, setRuleName] = useState('');
  const [keywordsText, setKeywordsText] = useState('price, pricing, cost, rates');
  const [matchType, setMatchType] = useState<'CONTAINS' | 'EXACT' | 'REGEX'>('CONTAINS');
  const [logic, setLogic] = useState<'AND' | 'OR'>('OR');
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [replyTemplateId, setReplyTemplateId] = useState('');
  const [customReply, setCustomReply] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(60);
  const [maxPerHour, setMaxPerHour] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenBuilder = (rule?: AutomationRule) => {
    if (rule) {
      setEditingRule(rule);
      setRuleName(rule.name);
      setKeywordsText(rule.conditions.keywords.join(', '));
      setMatchType(rule.conditions.matchType);
      setLogic(rule.conditions.logic);
      setCaseInsensitive(rule.conditions.caseInsensitive);
      setReplyTemplateId(rule.actions.replyTemplateId || '');
      setCustomReply(rule.actions.replyText || '');
      setCooldownSeconds(rule.cooldownSeconds);
      setMaxPerHour(rule.maxExecutionsPerHour);
    } else {
      setEditingRule(null);
      setRuleName('');
      setKeywordsText('price, pricing, cost, rates');
      setMatchType('CONTAINS');
      setLogic('OR');
      setCaseInsensitive(true);
      setReplyTemplateId(templates[0]?.id || '');
      setCustomReply('');
      setCooldownSeconds(60);
      setMaxPerHour(30);
    }
    setShowBuilder(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    const keywords = keywordsText
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      setSubmitting(true);
      await onSaveRule({
        id: editingRule?.id,
        name: ruleName,
        pageId: activePage?.pageId || '102938475610293',
        conditions: {
          keywords,
          matchType,
          logic,
          caseInsensitive,
        },
        actions: {
          replyTemplateId: replyTemplateId || undefined,
          replyText: customReply || undefined,
        },
        cooldownSeconds,
        maxExecutionsPerHour: maxPerHour,
        isEnabled: editingRule ? editingRule.isEnabled : true,
      });
      setShowBuilder(false);
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
            <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Auto Comment Rules Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Programmatic comment response flows with keywords, cooldowns, and anti-spam limits for{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {activePage?.name || 'Facebook Page'}
            </span>
          </p>
        </div>

        <button
          onClick={() => handleOpenBuilder()}
          className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center gap-2 shadow-sm shadow-purple-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Automation Rule</span>
        </button>
      </div>

      {/* Visual Rule Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingRule ? 'Edit Automation Rule' : 'Visual Rule Builder'}
                </h2>
              </div>
              <button
                onClick={() => setShowBuilder(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Rule Name */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Rule Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auto-Reply: Pricing Inquiries"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Visual Workflow Block 1: Trigger */}
              <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Step 1: WHEN
                </div>
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>New Page Comment Received via Webhook</span>
                  <span className="text-[10px] bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-mono">
                    Official feed webhook
                  </span>
                </div>
              </div>

              {/* Visual Workflow Block 2: Conditions */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Step 2: IF (Keyword Conditions)
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={keywordsText}
                    onChange={(e) => setKeywordsText(e.target.value)}
                    placeholder="price, cost, pricing, how much"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Match Type</label>
                    <select
                      value={matchType}
                      onChange={(e) => setMatchType(e.target.value as any)}
                      className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="CONTAINS">Contains Keyword</option>
                      <option value="EXACT">Exact Match</option>
                      <option value="REGEX">Regular Expression</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Logic</label>
                    <select
                      value={logic}
                      onChange={(e) => setLogic(e.target.value as any)}
                      className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="OR">ANY Keyword (OR)</option>
                      <option value="AND">ALL Keywords (AND)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="ci"
                      checked={caseInsensitive}
                      onChange={(e) => setCaseInsensitive(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <label htmlFor="ci" className="text-[11px] text-slate-600 dark:text-slate-300">
                      Case-Insensitive
                    </label>
                  </div>
                </div>
              </div>

              {/* Visual Workflow Block 3: Action */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step 3: THEN (Perform Official Action)
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    Select Response Template
                  </label>
                  <select
                    value={replyTemplateId}
                    onChange={(e) => setReplyTemplateId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="">Use custom reply text below...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ("{t.replyText.substring(0, 45)}...")
                      </option>
                    ))}
                  </select>
                </div>

                {!replyTemplateId && (
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">
                      Custom Reply Message
                    </label>
                    <textarea
                      rows={2}
                      value={customReply}
                      onChange={(e) => setCustomReply(e.target.value)}
                      placeholder="Thanks for reaching out! Please message our page for pricing details."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                )}
              </div>

              {/* Safeguards & Rate Limits */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    Cooldown (Seconds per user)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={3600}
                    value={cooldownSeconds}
                    onChange={(e) => setCooldownSeconds(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    Max Automated Replies / Hour
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={maxPerHour}
                    onChange={(e) => setMaxPerHour(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBuilder(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Automation Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {rule.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rule.isEnabled
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {rule.isEnabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>

              {/* Rule Visual Logic Pill */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400">IF comment contains</span>
                {rule.conditions.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-blue-600 dark:text-blue-400"
                  >
                    "{kw}"
                  </span>
                ))}
                <span className="text-slate-400">THEN reply via</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 font-semibold text-[11px] text-emerald-700 dark:text-emerald-300">
                  {rule.actions.replyTemplateId
                    ? templates.find((t) => t.id === rule.actions.replyTemplateId)?.name || 'Template'
                    : 'Custom Reply'}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-3">
                <span>Cooldown: {rule.cooldownSeconds}s</span>
                <span>•</span>
                <span>Max: {rule.maxExecutionsPerHour}/hr</span>
                <span>•</span>
                <span>Total Executions: {rule.totalExecutions || 0}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onToggleRule(rule.id)}
                className="text-slate-400 hover:text-slate-600"
                title={rule.isEnabled ? 'Disable rule' : 'Enable rule'}
              >
                {rule.isEnabled ? (
                  <ToggleRight className="w-7 h-7 text-purple-600" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-400" />
                )}
              </button>

              <button
                onClick={() => handleOpenBuilder(rule)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Edit
              </button>

              <button
                onClick={() => onDeleteRule(rule.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Logs Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          Recent Automation Executions
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Rule Name</th>
                <th className="py-2.5 px-3">Trigger Comment</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {executions.slice(0, 6).map((exec) => (
                <tr key={exec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        exec.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : exec.status === 'SKIPPED'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {exec.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {exec.ruleName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    "{exec.commentText}"
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {exec.actionTaken}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                    {exec.executionTimeMs}ms
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(exec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

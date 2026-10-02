import React, { useState } from 'react';
import { CommentTemplate, FacebookPage } from '../types';
import {
  FileCode2,
  Plus,
  Trash2,
  CheckCircle2,
  Tag,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface TemplatesViewProps {
  templates: CommentTemplate[];
  activePage?: FacebookPage;
  onSaveTemplate: (tmpl: Partial<CommentTemplate>) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  templates,
  activePage,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingTmpl, setEditingTmpl] = useState<Partial<CommentTemplate> | null>(null);
  const [name, setName] = useState('');
  const [replyText, setReplyText] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpen = (tmpl?: CommentTemplate) => {
    if (tmpl) {
      setEditingTmpl(tmpl);
      setName(tmpl.name);
      setReplyText(tmpl.replyText);
      setKeywordsText(tmpl.keywords?.join(', ') || '');
    } else {
      setEditingTmpl(null);
      setName('');
      setReplyText('');
      setKeywordsText('price, info, help');
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !replyText.trim()) return;

    try {
      setSubmitting(true);
      await onSaveTemplate({
        id: editingTmpl?.id,
        name,
        replyText,
        pageId: activePage?.pageId || '102938475610293',
        keywords: keywordsText
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
        status: 'ACTIVE',
      });
      setShowModal(false);
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
            <FileCode2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Auto-Reply Comment Templates
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standardized response templates for pricing, location, and FAQ automation on{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {activePage?.name || 'Facebook Page'}
            </span>
          </p>
        </div>

        <button
          onClick={() => handleOpen()}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 shadow-sm shadow-blue-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Template</span>
        </button>
      </div>

      {/* Templates Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingTmpl ? 'Edit Template' : 'New Response Template'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Template Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Price & Pricing Inquiry"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Reply Text
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Thanks for your interest! Please message our page for pricing details."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Associated Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="price, pricing, cost, how much"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {tmpl.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {tmpl.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "{tmpl.replyText}"
              </div>

              {/* Keywords */}
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="w-3 h-3 text-slate-400" />
                {tmpl.keywords?.map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{tmpl.executionCount || 0} automated dispatches</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpen(tmpl)}
                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteTemplate(tmpl.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

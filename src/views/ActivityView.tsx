import React, { useState } from 'react';
import { ActivityLog, FacebookPage } from '../types';
import {
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react';

interface ActivityViewProps {
  activityLogs: ActivityLog[];
  activePage?: FacebookPage;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  activityLogs,
  activePage,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      (log.details && log.details.toLowerCase().includes(search.toLowerCase())) ||
      log.actionType.toLowerCase().includes(search.toLowerCase()) ||
      (log.errorMessage && log.errorMessage.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const matchesAction = actionFilter === 'ALL' || log.actionType === actionFilter;

    return matchesSearch && matchesStatus && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Audit Activity Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete audit trail of every automated action, moderation check, and Meta API invocation
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs by keyword or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">Filter: All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="SKIPPED">SKIPPED</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">Filter: All Action Types</option>
            <option value="AUTO_REPLY_COMMENT">AUTO_REPLY_COMMENT</option>
            <option value="AUTO_REPLY_RULE">AUTO_REPLY_RULE</option>
            <option value="PAGE_POST_PUBLISH">PAGE_POST_PUBLISH</option>
            <option value="MODERATION_HIDE_COMMENT">MODERATION_HIDE_COMMENT</option>
            <option value="AUTO_REACTION_ATTEMPT">AUTO_REACTION_ATTEMPT</option>
            <option value="COMMENT_DELETE">COMMENT_DELETE</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Details / Target</th>
                <th className="py-3 px-4">Meta Status</th>
                <th className="py-3 px-4">Retry</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No matching activity log records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : log.status === 'SKIPPED'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {log.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                        {log.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                        {log.status === 'SKIPPED' && <AlertTriangle className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                      {log.actionType}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
                      {log.details || log.errorMessage || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {log.apiResponseStatus ? `${log.apiResponseStatus} OK` : '200 OK'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {log.retryCount || 0}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

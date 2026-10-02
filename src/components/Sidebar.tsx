import React from 'react';
import {
  LayoutDashboard,
  Layers,
  FileText,
  CalendarClock,
  MessageSquare,
  Bot,
  FileCode2,
  ShieldAlert,
  HeartHandshake,
  BarChart3,
  History,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'pages'
  | 'posts'
  | 'scheduled'
  | 'comments'
  | 'automations'
  | 'templates'
  | 'moderation'
  | 'reactions'
  | 'analytics'
  | 'activity'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  commentsCount?: number;
  scheduledCount?: number;
  automationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  commentsCount = 0,
  scheduledCount = 0,
  automationsCount = 0,
}) => {
  const navSections: Array<{
    group: string;
    items: Array<{
      id: NavTab;
      label: string;
      icon: React.ElementType;
      badge?: number | string;
      badgeColor?: string;
    }>;
  }> = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'pages', label: 'Connected Pages', icon: Layers },
      ],
    },
    {
      group: 'Publishing',
      items: [
        { id: 'posts', label: 'Page Posts', icon: FileText },
        {
          id: 'scheduled',
          label: 'Scheduled Queue',
          icon: CalendarClock,
          badge: scheduledCount > 0 ? scheduledCount : undefined,
          badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
        },
      ],
    },
    {
      group: 'Engagement & Automation',
      items: [
        {
          id: 'comments',
          label: 'Comments Feed',
          icon: MessageSquare,
          badge: commentsCount > 0 ? commentsCount : undefined,
          badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
        },
        {
          id: 'automations',
          label: 'Auto Reply Rules',
          icon: Bot,
          badge: automationsCount > 0 ? automationsCount : undefined,
          badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
        },
        { id: 'templates', label: 'Reply Templates', icon: FileCode2 },
        { id: 'moderation', label: 'Spam Moderation', icon: ShieldAlert },
        { id: 'reactions', label: 'Auto Reaction', icon: HeartHandshake },
      ],
    },
    {
      group: 'Intelligence & Audit',
      items: [
        { id: 'analytics', label: 'Meta Analytics', icon: BarChart3 },
        { id: 'activity', label: 'Activity Audit Log', icon: History },
        { id: 'settings', label: 'App Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 leading-none">
            PagePilot
            <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              v21
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">Official Meta Suite</div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((sec) => (
          <div key={sec.group}>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              {sec.group}
            </div>
            <div className="space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          active ? 'bg-white/20 text-white' : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Compliance Badge */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">Strict Meta Compliance</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">Zero browser automation. Official API endpoints only.</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

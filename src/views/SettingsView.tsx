import React, { useState } from 'react';
import { AppSettings, FacebookConnection } from '../types';
import {
  Settings,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Lock,
  Globe,
  Radio,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  connection: FacebookConnection | null;
  onUpdateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  onDisconnect: () => void;
  onResetSeed: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  connection,
  onUpdateSettings,
  onDisconnect,
  onResetSeed,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [timezone, setTimezone] = useState(settings.defaultTimezone || 'America/New_York');
  const [maxPerHour, setMaxPerHour] = useState(settings.maxRepliesPerHour || 50);
  const [cooldown, setCooldown] = useState(settings.defaultCooldownSeconds || 60);
  const [safetyMargin, setSafetyMargin] = useState(settings.rateLimitSafetyMarginPercent || 20);
  const [appId, setAppId] = useState(settings.metaAppId || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const redirectUri = `${window.location.origin}/auth/callback`;
  const webhookUrl = `${window.location.origin}/api/webhooks/facebook`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onUpdateSettings({
        defaultTimezone: timezone,
        maxRepliesPerHour: maxPerHour,
        defaultCooldownSeconds: cooldown,
        rateLimitSafetyMarginPercent: safetyMargin,
        metaAppId: appId,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          PagePilot System Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure Meta Developer credentials, webhooks, rate limits, and cryptographic keys
        </p>
      </div>

      {/* Connected Account Banner */}
      {connection && !connection.isSandboxMode ? (
        <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              Active Facebook Connection
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Connected as: {connection.facebookUserName} ({connection.facebookUserId})
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Official Meta Graph API {settings.metaApiVersion || 'v21.0'} Session • Tokens Encrypted (AES-256-GCM)
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              LIVE META ACCOUNT
            </span>
            <button
              type="button"
              onClick={onDisconnect}
              className="px-3 py-1 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : connection && connection.isSandboxMode ? (
        <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Active Facebook Connection
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Connected as: Demo user
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Demo user • Simulated Sandbox Session • Real Graph API calls bypassed
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              DEMO MODE
            </span>
            <button
              type="button"
              onClick={onDisconnect}
              className="px-3 py-1 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-500">Facebook Connection</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Not connected
            </div>
            <div className="text-xs text-slate-400">
              Connected as: Not connected
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            NOT CONNECTED
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Meta Graph API Credentials */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Globe className="w-4 h-4 text-blue-500" />
            Meta Developer Credentials & API Configuration
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meta App ID
              </label>
              <input
                type="text"
                placeholder="e.g. 102938475610293"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meta Graph API Version
              </label>
              <input
                type="text"
                disabled
                value={settings.metaApiVersion || 'v21.0'}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 font-mono cursor-not-allowed"
              />
            </div>
          </div>

          {/* Callback URL */}
          <div className="space-y-1.5 text-xs">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Valid OAuth Redirect URI (Copy to Meta App Settings → Facebook Login)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={redirectUri}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-blue-600 dark:text-blue-400 select-all"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(redirectUri, 'oauth')}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
              >
                {copiedKey === 'oauth' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'oauth' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Webhooks Configuration */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Radio className="w-4 h-4 text-purple-500" />
            Meta Webhook Integration
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            In your Meta App Dashboard under <strong>Webhooks → Page</strong>, enter the Callback URL and Verify Token below to enable real-time comment and feed events.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Webhook Callback URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-purple-600 dark:text-purple-400 select-all"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  {copiedKey === 'webhook' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'webhook' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Webhook Verify Token
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={settings.webhookVerifyToken}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 select-all"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(settings.webhookVerifyToken, 'token')}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  {copiedKey === 'token' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'token' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limiting & Safety Guardrails */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Sliders className="w-4 h-4 text-emerald-500" />
            Rate Limiting & Safety Margins
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Max Automated Replies / Hr
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={maxPerHour}
                onChange={(e) => setMaxPerHour(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Cooldown (Seconds)
              </label>
              <input
                type="number"
                min={10}
                max={600}
                value={cooldown}
                onChange={(e) => setCooldown(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Security & Cryptography Status */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Lock className="w-4 h-4 text-emerald-500" />
            Security & Zero-Exposure Cryptography
          </div>
          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>AES-256-GCM Server-side Key Storage Active</span>
            </div>
            <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded font-bold">
              VERIFIED
            </span>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Settings saved successfully!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>

      {/* Danger Zone: Disconnect / Reseed */}
      <div className="p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-rose-800 dark:text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          Account & Data Management
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Reset Sandbox Demo Data
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Reseed database with clean initial Facebook Page, posts, rules, and telemetry.
            </div>
          </div>
          <button
            type="button"
            onClick={onResetSeed}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0"
          >
            Reset Seed Data
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-rose-200/60 dark:border-rose-900/40">
          <div>
            <div className="text-xs font-bold text-rose-800 dark:text-rose-300">
              Disconnect Facebook Account
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Revoke active PagePilot Meta session and clear all stored delegate tokens.
            </div>
          </div>
          <button
            type="button"
            onClick={onDisconnect}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shrink-0 shadow-sm"
          >
            Disconnect Account
          </button>
        </div>
      </div>
    </div>
  );
};

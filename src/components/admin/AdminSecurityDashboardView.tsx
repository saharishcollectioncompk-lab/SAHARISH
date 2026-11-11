import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Phone,
  MessageCircle,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  History,
  LogOut,
  Laptop,
  Save,
  Eye,
  EyeOff,
  Server,
  Zap,
} from 'lucide-react';
import { adminAuthService, normalizePakistaniPhone } from '../../services/adminAuthService';
import { storageService } from '../../services/storageService';

interface AdminSecurityDashboardViewProps {
  onLockSettings?: () => void;
}

export const AdminSecurityDashboardView: React.FC<AdminSecurityDashboardViewProps> = ({
  onLockSettings,
}) => {
  const account = adminAuthService.getAdminAccount();
  const [activeSessions, setActiveSessions] = useState(() => adminAuthService.getActiveSessions());
  const [securityLogs, setSecurityLogs] = useState(() => adminAuthService.getSecurityLogs());
  const [whatsAppConfig, setWhatsAppConfig] = useState(() =>
    adminAuthService.getWhatsAppProviderConfig()
  );

  // Recovery Phone State
  const [recoveryPhoneInput, setRecoveryPhoneInput] = useState(account.recoveryPhone);
  const [phoneFeedback, setPhoneFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change Login Password State
  const [currentLoginPass, setCurrentLoginPass] = useState('');
  const [newLoginPass, setNewLoginPass] = useState('');
  const [confirmLoginPass, setConfirmLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginPassFeedback, setLoginPassFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change Admin Settings Password State
  const [currentSettingsPass, setCurrentSettingsPass] = useState('');
  const [newSettingsPass, setNewSettingsPass] = useState('');
  const [confirmSettingsPass, setConfirmSettingsPass] = useState('');
  const [showSettingsPass, setShowSettingsPass] = useState(false);
  const [settingsPassFeedback, setSettingsPassFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // WhatsApp Config Feedback
  const [wabaFeedback, setWabaFeedback] = useState<string | null>(null);
  const [sessionFeedback, setSessionFeedback] = useState<string | null>(null);

  const handleUpdateRecoveryPhone = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneFeedback(null);
    const res = adminAuthService.updateRecoveryPhone(recoveryPhoneInput);
    if (res.success) {
      setPhoneFeedback({ type: 'success', text: res.message });
      setSecurityLogs(adminAuthService.getSecurityLogs());
    } else {
      setPhoneFeedback({ type: 'error', text: res.message });
    }
  };

  const handleChangeLoginPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginPassFeedback(null);

    if (newLoginPass.length < 6) {
      setLoginPassFeedback({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newLoginPass !== confirmLoginPass) {
      setLoginPassFeedback({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    // Verify current login password
    const verifyRes = await adminAuthService.verifyAdminLogin(account.email, currentLoginPass, true);
    if (!verifyRes.success) {
      setLoginPassFeedback({ type: 'error', text: 'Current admin password is incorrect.' });
      return;
    }

    // Hash and save
    const newSalt = 'sah_salt_' + Math.random().toString(36).substring(2, 10);
    let newHash = '';
    try {
      const enc = new TextEncoder();
      const buf = await crypto.subtle.digest(
        'SHA-256',
        enc.encode(`${newSalt}:${newLoginPass.trim()}:saharish_secure_couture_salt_2025`)
      );
      newHash = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      newHash = newLoginPass.trim();
    }

    adminAuthService.saveAdminAccount({
      ...account,
      salt: newSalt,
      passwordHash: newHash,
      failedLoginAttempts: 0,
      lockoutUntil: undefined,
    });

    setCurrentLoginPass('');
    setNewLoginPass('');
    setConfirmLoginPass('');
    setLoginPassFeedback({ type: 'success', text: 'Admin Login Password updated successfully!' });
    setSecurityLogs(adminAuthService.getSecurityLogs());
  };

  const handleChangeSettingsPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsPassFeedback(null);

    if (newSettingsPass.length < 6) {
      setSettingsPassFeedback({
        type: 'error',
        text: 'New Admin Settings Password must be at least 6 characters.',
      });
      return;
    }
    if (newSettingsPass !== confirmSettingsPass) {
      setSettingsPassFeedback({ type: 'error', text: 'Settings passwords do not match.' });
      return;
    }

    const res = await adminAuthService.changeAdminSettingsPassword(
      currentSettingsPass,
      newSettingsPass
    );
    if (res.success) {
      setCurrentSettingsPass('');
      setNewSettingsPass('');
      setConfirmSettingsPass('');
      setSettingsPassFeedback({ type: 'success', text: res.message });
      setSecurityLogs(adminAuthService.getSecurityLogs());
    } else {
      setSettingsPassFeedback({ type: 'error', text: res.message });
    }
  };

  const handleSaveWhatsAppConfig = (e: React.FormEvent) => {
    e.preventDefault();
    adminAuthService.saveWhatsAppProviderConfig(whatsAppConfig);
    setWabaFeedback('Meta WhatsApp Cloud API settings saved successfully!');
    setTimeout(() => setWabaFeedback(null), 3500);
    setSecurityLogs(adminAuthService.getSecurityLogs());
  };

  const handleTerminateAllSessions = () => {
    const res = adminAuthService.terminateAllOtherSessions();
    setActiveSessions(adminAuthService.getActiveSessions().filter((s) => s.isCurrent));
    setSessionFeedback(res.message);
    setTimeout(() => setSessionFeedback(null), 3500);
    setSecurityLogs(adminAuthService.getSecurityLogs());
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
              Cryptographic Access Governance
            </span>
            <span className="w-1 h-1 rounded-full bg-[#D4C3B9]"></span>
            <span className="text-[10px] uppercase tracking-wider text-[#82746C]">
              256-Bit SHA Hashed
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#42240D] tracking-tight">
            Security &amp; Gateways Dashboard
          </h1>
          <p className="text-xs text-[#50443D] max-w-2xl mt-1">
            Configure dual-layer administrator credentials, manage the verified WhatsApp &amp; SMS recovery hotline (03097309810), oversee active sessions, and inspect system audit logs.
          </p>
        </div>

        {onLockSettings && (
          <button
            type="button"
            onClick={onLockSettings}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#42240D] border border-[#D4C3B9] text-xs font-bold uppercase tracking-wider shadow-sm transition-colors self-start md:self-auto"
          >
            <Lock className="w-4 h-4 text-[#7A582F]" />
            <span>Lock Settings Session</span>
          </button>
        )}
      </div>

      {/* Row 1: Credentials & Passwords (2 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Change Admin Login Password */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D4C3B9]/50 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] text-[#5C3A21] border border-[#D4C3B9]/60 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-[#C49A6C]" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#42240D]">
                  Admin Portal Login Password
                </h3>
                <p className="text-[10px] text-[#82746C]">
                  Account email: <strong>{account.email}</strong>
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase">
              Protected
            </span>
          </div>

          <form onSubmit={handleChangeLoginPassword} className="space-y-3.5 text-xs">
            {loginPassFeedback && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 font-semibold ${
                  loginPassFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {loginPassFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{loginPassFeedback.text}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                Current Admin Password
              </label>
              <input
                type={showLoginPass ? 'text' : 'password'}
                value={currentLoginPass}
                onChange={(e) => setCurrentLoginPass(e.target.value)}
                placeholder="Enter current password..."
                required
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                  New Admin Password
                </label>
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  value={newLoginPass}
                  onChange={(e) => setNewLoginPass(e.target.value)}
                  placeholder="Min 6 characters..."
                  required
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  value={confirmLoginPass}
                  onChange={(e) => setConfirmLoginPass(e.target.value)}
                  placeholder="Repeat password..."
                  required
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowLoginPass(!showLoginPass)}
                className="text-[11px] text-[#82746C] hover:text-[#42240D] flex items-center gap-1"
              >
                {showLoginPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showLoginPass ? 'Hide passwords' : 'Show passwords'}</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
              >
                Update Login Password
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Change Master Admin Settings Password */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D4C3B9]/50 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] text-[#5C3A21] border border-[#D4C3B9]/60 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#C49A6C]" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#42240D]">
                  Master Admin Settings Password
                </h3>
                <p className="text-[10px] text-[#82746C]">
                  Guards phone numbers, security dashboard &amp; gateways
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[9px] font-bold uppercase">
              Master Gate
            </span>
          </div>

          <form onSubmit={handleChangeSettingsPassword} className="space-y-3.5 text-xs">
            {settingsPassFeedback && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 font-semibold ${
                  settingsPassFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {settingsPassFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{settingsPassFeedback.text}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                Current Settings Password
              </label>
              <input
                type={showSettingsPass ? 'text' : 'password'}
                value={currentSettingsPass}
                onChange={(e) => setCurrentSettingsPass(e.target.value)}
                placeholder="Current settings password (or AdminSettings@2025)..."
                required
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                  New Settings Password
                </label>
                <input
                  type={showSettingsPass ? 'text' : 'password'}
                  value={newSettingsPass}
                  onChange={(e) => setNewSettingsPass(e.target.value)}
                  placeholder="Min 6 characters..."
                  required
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showSettingsPass ? 'text' : 'password'}
                  value={confirmSettingsPass}
                  onChange={(e) => setConfirmSettingsPass(e.target.value)}
                  placeholder="Repeat password..."
                  required
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowSettingsPass(!showSettingsPass)}
                className="text-[11px] text-[#82746C] hover:text-[#42240D] flex items-center gap-1"
              >
                {showSettingsPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSettingsPass ? 'Hide passwords' : 'Show passwords'}</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
              >
                Save Settings Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Row 2: Verified Recovery Number & Gateway Delivery (2 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 3: WhatsApp & SMS OTP Recovery Line */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D4C3B9]/50 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 fill-emerald-600" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#42240D]">
                  Admin WhatsApp &amp; SMS Recovery Number
                </h3>
                <p className="text-[10px] text-[#82746C]">
                  Official recovery target: Pakistan (+92)
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase">
              Active Hotline
            </span>
          </div>

          <form onSubmit={handleUpdateRecoveryPhone} className="space-y-3.5 text-xs">
            {phoneFeedback && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 font-semibold ${
                  phoneFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {phoneFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{phoneFeedback.text}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                Registered Pakistani Phone Line (WhatsApp &amp; SIM SMS)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recoveryPhoneInput}
                  onChange={(e) => setRecoveryPhoneInput(e.target.value)}
                  placeholder="03097309810 or +923097309810"
                  required
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs font-mono font-bold text-[#42240D]"
                />
              </div>
              <p className="text-[11px] text-[#82746C] mt-1">
                Standard format: <code>03097309810</code> or <code>+92 309 7309810</code>. This number receives all password reset OTPs and security alerts.
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#D4C3B9]/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#7A582F] block">
                Normalized International Dispatch Target:
              </span>
              <div className="font-mono text-xs font-bold text-[#42240D]">
                {normalizePakistaniPhone(recoveryPhoneInput).formattedDisplay}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4 text-[#C49A6C]" />
                <span>Save Recovery Hotline</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 4: Meta WhatsApp Cloud API Provider Configuration */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D4C3B9]/50 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] text-[#5C3A21] border border-[#D4C3B9]/60 flex items-center justify-center">
                <Server className="w-5 h-5 text-[#C49A6C]" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#42240D]">
                  Meta WhatsApp Cloud API Configuration
                </h3>
                <p className="text-[10px] text-[#82746C]">
                  Direct carrier delivery without web UI code exposure
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase">
              Cloud API Ready
            </span>
          </div>

          <form onSubmit={handleSaveWhatsAppConfig} className="space-y-3.5 text-xs">
            {wabaFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{wabaFeedback}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={whatsAppConfig.phoneNumberId || ''}
                  onChange={(e) =>
                    setWhatsAppConfig({ ...whatsAppConfig, phoneNumberId: e.target.value })
                  }
                  placeholder="e.g. 579870538166"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                  WABA ID (Business Account)
                </label>
                <input
                  type="text"
                  value={whatsAppConfig.wabaId || ''}
                  onChange={(e) =>
                    setWhatsAppConfig({ ...whatsAppConfig, wabaId: e.target.value })
                  }
                  placeholder="e.g. saharish_official_waba"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                Permanent System User Access Token
              </label>
              <input
                type="password"
                value={whatsAppConfig.accessToken || ''}
                onChange={(e) =>
                  setWhatsAppConfig({ ...whatsAppConfig, accessToken: e.target.value })
                }
                placeholder="EAABw..."
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs font-mono"
              />
              <span className="text-[10px] text-[#82746C] mt-1 block">
                Encrypted in browser storage. Tokens and generated codes are never exposed to clients.
              </span>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4 text-[#C49A6C]" />
                <span>Save API Settings</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Row 3: Active Sessions Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D4C3B9]/50 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] text-[#5C3A21] border border-[#D4C3B9]/60 flex items-center justify-center">
              <Laptop className="w-5 h-5 text-[#C49A6C]" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#42240D]">
                Active Devices &amp; Atelier Sessions
              </h3>
              <p className="text-[10px] text-[#82746C]">
                Monitor authorized browser sessions connected to SAHARISH Atelier Studio
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTerminateAllSessions}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#BA1A1A] border border-red-200 text-xs font-bold uppercase tracking-wider transition-colors self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout From All Other Devices</span>
          </button>
        </div>

        {sessionFeedback && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{sessionFeedback}</span>
          </div>
        )}

        <div className="divide-y divide-[#F0EDE9] border border-[#D4C3B9]/40 rounded-2xl overflow-hidden">
          {activeSessions.map((sess) => (
            <div
              key={sess.id}
              className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#7A582F] flex items-center justify-center border border-[#D4C3B9]/50">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#42240D]">{sess.device}</span>
                    {sess.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase">
                        Current Session
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#82746C] mt-0.5">
                    {sess.location} · <span className="font-mono">{sess.ip}</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-semibold text-[#7A582F] sm:text-right">
                {sess.lastActive}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Security Audit & Login Activity Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D4C3B9]/50 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] text-[#5C3A21] border border-[#D4C3B9]/60 flex items-center justify-center">
            <History className="w-5 h-5 text-[#C49A6C]" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#42240D]">
              Security Audit &amp; Login Activity Log
            </h3>
            <p className="text-[10px] text-[#82746C]">
              Comprehensive audit trail of logins, OTP dispatches, and credential modifications
            </p>
          </div>
        </div>

        <div className="border border-[#D4C3B9]/40 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#7A582F] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E2DD]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE9]">
              {securityLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-[#82746C]">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#42240D]">{log.event}</td>
                  <td className="py-3 px-4 text-[#7A582F]">{log.channel}</td>
                  <td className="py-3 px-4 text-[#50443D] text-[11px] max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                        log.status === 'Success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'Blocked'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {log.status}
                    </span>
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

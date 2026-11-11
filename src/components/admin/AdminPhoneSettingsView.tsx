import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageCircle,
  Smartphone,
  Bell,
  ShieldAlert,
  CheckCircle2,
  Send,
  Save,
  RotateCcw,
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { AdminSettings, AdminNotificationLog } from '../../types';
import { storageService } from '../../services/storageService';
import { adminNotificationService } from '../../services/adminNotificationService';
import {
  adminAuthService,
  AdminSecurityEvent,
  normalizePakistaniPhone,
  hashPasswordWithSalt,
} from '../../services/adminAuthService';

export const AdminPhoneSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettings>(() => storageService.getAdminSettings());
  const [logs, setLogs] = useState<AdminNotificationLog[]>(() => storageService.getNotificationLogs());
  const [securityLogs, setSecurityLogs] = useState<AdminSecurityEvent[]>(() =>
    adminAuthService.getSecurityLogs()
  );
  const [adminAccount, setAdminAccount] = useState(() => adminAuthService.getAdminAccount());

  const [saveToast, setSaveToast] = useState(false);
  const [testSentToast, setTestSentToast] = useState(false);

  // Field states
  const [phone1, setPhone1] = useState(settings.adminPhone1.number || '+92 309 7309810');
  const [phone1WhatsApp, setPhone1WhatsApp] = useState(settings.adminPhone1.whatsAppEnabled);
  const [phone1SMS, setPhone1SMS] = useState(settings.adminPhone1.smsEnabled);

  const [phone2, setPhone2] = useState(settings.adminPhone2.number || '+92 307 4127062');
  const [phone2WhatsApp, setPhone2WhatsApp] = useState(settings.adminPhone2.whatsAppEnabled);
  const [phone2SMS, setPhone2SMS] = useState(settings.adminPhone2.smsEnabled);

  // Event triggers
  const [notifyOnReg, setNotifyOnReg] = useState(settings.notifyOnRegistration);
  const [notifyOnOrd, setNotifyOnOrd] = useState(settings.notifyOnOrder);
  const [notifyOnSec, setNotifyOnSec] = useState(settings.notifyOnAccountActivity);

  // Concierge lines
  const [officialWhatsApp, setOfficialWhatsApp] = useState(settings.officialWhatsAppNumber || '+92 309 7309810');
  const [officialEmail, setOfficialEmail] = useState(settings.officialEmail || 'saharishcollection.com.pk@gmail.com');

  // Admin Recovery Phone Management
  const [recoveryPhoneInput, setRecoveryPhoneInput] = useState(adminAccount.recoveryPhone || '03097309810');
  const [recoveryPhoneToast, setRecoveryPhoneToast] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  // Password Management States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordToast, setPasswordToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setSecurityLogs(adminAuthService.getSecurityLogs());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AdminSettings = {
      ...settings,
      adminPhone1: {
        ...settings.adminPhone1,
        number: phone1,
        whatsAppEnabled: phone1WhatsApp,
        smsEnabled: phone1SMS,
      },
      adminPhone2: {
        ...settings.adminPhone2,
        number: phone2,
        whatsAppEnabled: phone2WhatsApp,
        smsEnabled: phone2SMS,
      },
      notifyOnRegistration: notifyOnReg,
      notifyOnOrder: notifyOnOrd,
      notifyOnAccountActivity: notifyOnSec,
      officialWhatsAppNumber: officialWhatsApp,
      officialEmail,
    };

    storageService.saveAdminSettings(updated);
    setSettings(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleUpdateRecoveryNumber = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryPhoneToast(null);

    const result = adminAuthService.updateRecoveryPhone(recoveryPhoneInput);
    if (result.success) {
      const updatedAccount = adminAuthService.getAdminAccount();
      setAdminAccount(updatedAccount);
      setSecurityLogs(adminAuthService.getSecurityLogs());
      setRecoveryPhoneToast({ text: result.message, type: 'success' });
      setPhone1(normalizePakistaniPhone(recoveryPhoneInput).formattedDisplay);
    } else {
      setRecoveryPhoneToast({ text: result.message, type: 'error' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordToast(null);

    if (newAdminPassword.length < 6) {
      setPasswordToast({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordToast({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    // Verify current password first
    const verifyResult = await adminAuthService.verifyAdminLogin(adminAccount.email, currentPassword, false);
    if (!verifyResult.success) {
      setPasswordToast({ text: 'Current password is incorrect. Verification rejected.', type: 'error' });
      return;
    }

    // Update password
    const newSalt = 'sah_salt_' + Math.random().toString(36).substring(2, 10);
    const newHash = await hashPasswordWithSalt(newAdminPassword, newSalt);

    adminAuthService.saveAdminAccount({
      ...adminAccount,
      salt: newSalt,
      passwordHash: newHash,
      failedLoginAttempts: 0,
      lockoutUntil: undefined,
    });

    adminAuthService.logSecurityEvent({
      event: 'Password Changed',
      channel: 'Web Session',
      details: 'Administrator password updated via Admin Security Settings.',
      status: 'Success',
    });

    setAdminAccount(adminAuthService.getAdminAccount());
    setSecurityLogs(adminAuthService.getSecurityLogs());
    setCurrentPassword('');
    setNewAdminPassword('');
    setConfirmAdminPassword('');
    setPasswordToast({ text: 'Admin password updated and hashed successfully!', type: 'success' });
  };

  const handleSendTestNotification = () => {
    adminNotificationService.notifyAdmins({
      event: 'New Boutique Order',
      customerName: 'Test Patron (Maha Al-Saharish)',
      customerPhone: '+92 300 0000000',
      customerEmail: 'saharishcollection.com.pk@gmail.com',
      orderNumber: '#SAH-TEST-99',
      orderTotal: 18500,
      details: 'Test simulation alert validating dual Admin Phone routing.',
    });

    setLogs(storageService.getNotificationLogs());
    setTestSentToast(true);
    setTimeout(() => setTestSentToast(false), 3500);
  };

  const handleResetDefaults = () => {
    setPhone1('+92 309 7309810');
    setPhone1WhatsApp(true);
    setPhone1SMS(true);

    setPhone2('+92 307 4127062');
    setPhone2WhatsApp(true);
    setPhone2SMS(true);

    setNotifyOnReg(true);
    setNotifyOnOrd(true);
    setNotifyOnSec(true);

    setRecoveryPhoneInput('03097309810');
    adminAuthService.updateRecoveryPhone('03097309810');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
              Atelier Communications &amp; Gateway Dispatch
            </span>
            <span className="w-1 h-1 rounded-full bg-[#D4C3B9]"></span>
            <span className="text-[10px] uppercase tracking-wider text-[#82746C]">
              Meta Cloud API &amp; Direct SIM
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#42240D] tracking-tight">
            Admin Phone &amp; Security Settings
          </h1>
          <p className="text-xs text-[#50443D] max-w-2xl mt-1">
            Configure the two primary administrator dispatch lines to receive WhatsApp and SMS operational alerts for registrations, new boutique orders, and account activity. Manage the official admin password recovery line.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#D4C3B9] text-xs font-bold uppercase tracking-wider text-[#50443D] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#82746C]" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSendTestNotification}
            className="px-4 py-2 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Test Notification</span>
          </button>
        </div>
      </div>

      {/* Critical Security Clarification Card */}
      <div className="p-4 rounded-2xl bg-[#F7E7E0] border border-[#C49A6C] flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#5C3A21] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#42240D]">
            Strict Privacy &amp; OTP Separation Protocol
          </h4>
          <p className="text-xs text-[#50443D] leading-relaxed">
            Customer OTP verification codes are delivered exclusively to the customer's own registered mobile or WhatsApp number. The two admin phone numbers configured below receive administrative alerts only (new client registration, order notifications, security activities), never customer private OTP credentials.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Phone Number 1 Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D4C3B9]/50 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE9]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#5C3A21] text-white flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#42240D]">
                      Admin Phone Number 1
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A582F]">
                      Primary Stylist Line &amp; WhatsApp Recovery Line
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#42240D] mb-1.5 tracking-wider">
                  Editable Phone Number (Pakistan +92)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#82746C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone1}
                    onChange={(e) => setPhone1(e.target.value)}
                    placeholder="03097309810 or +92 309 7309810"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-sm font-mono font-bold text-[#42240D] focus:outline-none focus:border-[#5C3A21]"
                    required
                  />
                </div>
                <p className="text-[10px] text-[#82746C] mt-1">
                  Initial Registered Recovery Number:{' '}
                  <strong className="font-mono text-[#5C3A21]">03097309810 (+92 309 7309810)</strong>
                </p>
              </div>

              {/* Independent Toggles for Admin 1 */}
              <div className="space-y-3 pt-2">
                <span className="text-xs uppercase font-bold text-[#42240D] tracking-wider block">
                  Delivery Channels (Independent)
                </span>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#D4C3B9]/60 cursor-pointer hover:bg-[#F0EDE9] transition-colors">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-[#42240D]">WhatsApp Notifications</div>
                      <div className="text-[10px] text-[#82746C]">Receive real-time WhatsApp Business alerts</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={phone1WhatsApp}
                    onChange={(e) => setPhone1WhatsApp(e.target.checked)}
                    className="w-4 h-4 text-[#5C3A21] accent-[#5C3A21] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#D4C3B9]/60 cursor-pointer hover:bg-[#F0EDE9] transition-colors">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-[#5C3A21]" />
                    <div>
                      <div className="text-xs font-bold text-[#42240D]">SMS Notifications</div>
                      <div className="text-[10px] text-[#82746C]">Direct SMS alerts via telecom gateway</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={phone1SMS}
                    onChange={(e) => setPhone1SMS(e.target.checked)}
                    className="w-4 h-4 text-[#5C3A21] accent-[#5C3A21] rounded"
                  />
                </label>
              </div>
            </div>

            <div className="text-[11px] text-[#82746C] pt-2 border-t border-[#F0EDE9]">
              Status: Receives operational alerts via{' '}
              <strong className="text-[#42240D]">
                {[phone1WhatsApp && 'WhatsApp', phone1SMS && 'SMS'].filter(Boolean).join(' & ') || 'None (Disabled)'}
              </strong>
            </div>
          </div>

          {/* Admin Phone Number 2 Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D4C3B9]/50 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE9]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#5C3A21] text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#42240D]">
                      Admin Phone Number 2
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A582F]">
                      Secondary Dispatch &amp; Client Care
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#42240D] mb-1.5 tracking-wider">
                  Editable Phone Number (Pakistan +92)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#82746C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                    placeholder="03074127062 or +92 307 4127062"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-sm font-mono font-bold text-[#42240D] focus:outline-none focus:border-[#5C3A21]"
                    required
                  />
                </div>
                <p className="text-[10px] text-[#82746C] mt-1">
                  Default Line 2:{' '}
                  <strong className="font-mono text-[#5C3A21]">03074127062 (+92 307 4127062)</strong>
                </p>
              </div>

              {/* Independent Toggles for Admin 2 */}
              <div className="space-y-3 pt-2">
                <span className="text-xs uppercase font-bold text-[#42240D] tracking-wider block">
                  Delivery Channels (Independent)
                </span>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#D4C3B9]/60 cursor-pointer hover:bg-[#F0EDE9] transition-colors">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-[#42240D]">WhatsApp Notifications</div>
                      <div className="text-[10px] text-[#82746C]">Receive real-time WhatsApp Business alerts</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={phone2WhatsApp}
                    onChange={(e) => setPhone2WhatsApp(e.target.checked)}
                    className="w-4 h-4 text-[#5C3A21] accent-[#5C3A21] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#D4C3B9]/60 cursor-pointer hover:bg-[#F0EDE9] transition-colors">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-[#5C3A21]" />
                    <div>
                      <div className="text-xs font-bold text-[#42240D]">SMS Notifications</div>
                      <div className="text-[10px] text-[#82746C]">Direct SMS alerts via telecom gateway</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={phone2SMS}
                    onChange={(e) => setPhone2SMS(e.target.checked)}
                    className="w-4 h-4 text-[#5C3A21] accent-[#5C3A21] rounded"
                  />
                </label>
              </div>
            </div>

            <div className="text-[11px] text-[#82746C] pt-2 border-t border-[#F0EDE9]">
              Status: Receives operational alerts via{' '}
              <strong className="text-[#42240D]">
                {[phone2WhatsApp && 'WhatsApp', phone2SMS && 'SMS'].filter(Boolean).join(' & ') || 'None (Disabled)'}
              </strong>
            </div>
          </div>
        </div>

        {/* Operational Event Notification Rules Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D4C3B9]/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0EDE9]">
            <Bell className="w-5 h-5 text-[#5C3A21]" />
            <h3 className="font-serif text-lg font-bold text-[#42240D]">
              Operational Event Trigger Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="p-4 rounded-xl border border-[#D4C3B9]/60 bg-[#FAF7F2] flex items-start gap-3 cursor-pointer hover:bg-[#F0EDE9] transition-colors">
              <input
                type="checkbox"
                checked={notifyOnReg}
                onChange={(e) => setNotifyOnReg(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-[#5C3A21] accent-[#5C3A21] rounded"
              />
              <div>
                <span className="text-xs font-bold text-[#42240D] block">
                  New Customer Registration
                </span>
                <span className="text-[11px] text-[#82746C]">
                  Notify both admins when a patron registers and completes OTP.
                </span>
              </div>
            </label>

            <label className="p-4 rounded-xl border border-[#D4C3B9]/60 bg-[#FAF7F2] flex items-start gap-3 cursor-pointer hover:bg-[#F0EDE9] transition-colors">
              <input
                type="checkbox"
                checked={notifyOnOrd}
                onChange={(e) => setNotifyOnOrd(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-[#5C3A21] accent-[#5C3A21] rounded"
              />
              <div>
                <span className="text-xs font-bold text-[#42240D] block">New Boutique Orders</span>
                <span className="text-[11px] text-[#82746C]">
                  Dispatch instant alerts with total PKR, order ID, and client info.
                </span>
              </div>
            </label>

            <label className="p-4 rounded-xl border border-[#D4C3B9]/60 bg-[#FAF7F2] flex items-start gap-3 cursor-pointer hover:bg-[#F0EDE9] transition-colors">
              <input
                type="checkbox"
                checked={notifyOnSec}
                onChange={(e) => setNotifyOnSec(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-[#5C3A21] accent-[#5C3A21] rounded"
              />
              <div>
                <span className="text-xs font-bold text-[#42240D] block">Security &amp; Account Alerts</span>
                <span className="text-[11px] text-[#82746C]">
                  Alert for administrator password recovery attempts and critical changes.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-[#82746C]">
            Changes take effect immediately on next registration or order.
          </div>

          <div className="flex items-center gap-3">
            {saveToast && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
              </span>
            )}
            {testSentToast && (
              <span className="text-xs text-[#5C3A21] font-bold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Test notifications sent to active channels!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#C49A6C]" />
              <span>Save Admin Settings</span>
            </button>
          </div>
        </div>
      </form>

      {/* ======================================================== */}
      {/* ADMIN ACCOUNT & RECOVERY SECURITY SETTINGS SECTION       */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#C49A6C] shadow-md space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5C3A21] text-[#FAF7F2] flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#C49A6C]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#42240D]">
                Admin Account &amp; Password Recovery Security Settings
              </h3>
              <p className="text-xs text-[#50443D]">
                Manage official admin WhatsApp/SMS recovery line (03097309810), authorized admin email, and hashed credentials.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#F7E7E0] text-[#5C3A21] text-[10px] font-bold uppercase tracking-wider border border-[#C49A6C]/40">
            Protected Atelier Protocol
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recovery Number Management Card */}
          <form onSubmit={handleUpdateRecoveryNumber} className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4C3B9] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#42240D] flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Admin WhatsApp / SMS Recovery Number</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#25D366]/20 text-emerald-800 font-bold uppercase">
                Pakistan (+92)
              </span>
            </div>

            <p className="text-xs text-[#50443D] leading-relaxed">
              When the administrator uses "Forgot Password", secure 6-digit OTP codes are delivered directly to this number via WhatsApp Business and Direct SMS.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#42240D]">
                Recovery Mobile Number
              </label>
              <input
                type="text"
                value={recoveryPhoneInput}
                onChange={(e) => setRecoveryPhoneInput(e.target.value)}
                placeholder="03097309810"
                className="w-full bg-white text-[#1C1C19] border border-[#D4C3B9] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-[#5C3A21]"
                required
              />
              <div className="text-[10px] text-[#82746C] flex items-center justify-between">
                <span>International Normalized:</span>
                <span className="font-mono text-[#5C3A21] font-bold">
                  {normalizePakistaniPhone(recoveryPhoneInput).formattedDisplay}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#42240D]">
                Registered Admin Email / Gmail
              </label>
              <input
                type="email"
                disabled
                value={adminAccount.email}
                className="w-full bg-[#EBE8E3] text-[#50443D] border border-[#D4C3B9] rounded-xl px-3.5 py-2.5 text-xs font-mono cursor-not-allowed"
              />
              <span className="text-[10px] text-[#82746C]">
                Used for identity verification during password recovery.
              </span>
            </div>

            {recoveryPhoneToast && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  recoveryPhoneToast.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {recoveryPhoneToast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{recoveryPhoneToast.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Update Recovery Number</span>
            </button>
          </form>

          {/* Change Admin Password Card */}
          <form onSubmit={handleChangePassword} className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4C3B9] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#42240D] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#5C3A21]" />
                <span>Change Administrator Password</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="text-[10px] text-[#7A582F] hover:underline font-bold"
              >
                {showPasswordFields ? 'Hide Passwords' : 'Show Passwords'}
              </button>
            </div>

            <p className="text-xs text-[#50443D] leading-relaxed">
              Passwords are salted and cryptographically hashed before storing in the database. Never shared via WhatsApp or plaintext.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#42240D]">
                Current Password
              </label>
              <input
                type={showPasswordFields ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-white text-[#1C1C19] border border-[#D4C3B9] rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-[#5C3A21]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#42240D]">
                New Admin Password
              </label>
              <input
                type={showPasswordFields ? 'text' : 'password'}
                required
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-white text-[#1C1C19] border border-[#D4C3B9] rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-[#5C3A21]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#42240D]">
                Confirm New Password
              </label>
              <input
                type={showPasswordFields ? 'text' : 'password'}
                required
                value={confirmAdminPassword}
                onChange={(e) => setConfirmAdminPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-white text-[#1C1C19] border border-[#D4C3B9] rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-[#5C3A21]"
              />
            </div>

            {passwordToast && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  passwordToast.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {passwordToast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{passwordToast.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#42240D] hover:bg-[#2F1502] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <KeyRound className="w-4 h-4 text-[#C49A6C]" />
              <span>Update Admin Password</span>
            </button>
          </form>
        </div>

        {/* Security Audit & Password Recovery Event History */}
        <div className="pt-4 border-t border-[#F0EDE9] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-[#42240D] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7A582F]" />
              <span>Security Activity &amp; Password Recovery Audit Log</span>
            </span>
            <span className="text-[10px] text-[#82746C] font-mono">
              {securityLogs.length} events logged
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {securityLogs.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#FAF7F2] border border-[#D4C3B9]/50 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        item.status === 'Success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Blocked'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.event}
                    </span>
                    <span className="text-[10px] text-[#82746C] font-mono">
                      {item.channel || 'System'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#50443D]">{item.details}</p>
                </div>
                <span className="text-[10px] text-[#82746C] font-mono whitespace-nowrap pl-3">
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Notification Audit Log */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D4C3B9]/50 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE9]">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#42240D]">
              Admin Notification Delivery Log
            </h3>
            <p className="text-xs text-[#50443D]">
              Real-time audit log of automated alerts dispatched to Admin 1 and Admin 2.
            </p>
          </div>
          <span className="text-xs text-[#82746C] font-mono">
            {logs.length} events recorded
          </span>
        </div>

        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#D4C3B9]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      log.channel === 'WhatsApp'
                        ? 'bg-[#25D366]/20 text-emerald-800'
                        : 'bg-[#5C3A21]/20 text-[#42240D]'
                    }`}
                  >
                    {log.channel}
                  </span>
                  <span className="font-bold text-[#42240D]">{log.recipient}</span>
                  <span className="text-[#82746C]">· {log.event}</span>
                </div>
                <p className="text-[#50443D]">{log.message}</p>
              </div>

              <div className="flex sm:flex-col sm:items-end justify-between text-[11px] text-[#82746C] shrink-0">
                <span className="text-emerald-700 font-semibold">{log.status}</span>
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

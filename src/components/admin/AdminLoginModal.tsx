import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Smartphone,
  RotateCcw,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Diamond,
  Store,
  ExternalLink,
} from 'lucide-react';
import { adminAuthService, normalizePakistaniPhone } from '../../services/adminAuthService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onLoginSuccess: () => void;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  onClose,
}) => {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('saharishcollection.com.pk@gmail.com');
  const [loginPassword, setLoginPassword] = useState('Saharish@2025');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccessNotice, setLoginSuccessNotice] = useState('');

  // Password Recovery States
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify' | 'new_password'>('request');
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('saharishcollection.com.pk@gmail.com');
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [recoveryPhoneDisplay, setRecoveryPhoneDisplay] = useState('03097309810');
  const [recoveryNormalizedDisplay, setRecoveryNormalizedDisplay] = useState('+92 309 7309810');
  const [recoveryWhatsAppUrl, setRecoveryWhatsAppUrl] = useState<string | undefined>();
  const [recoverySmsUrl, setRecoverySmsUrl] = useState<string | undefined>();

  // OTP Verification States
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpExpiresIn, setOtpExpiresIn] = useState(300); // 5 minutes in seconds
  const [activeResetToken, setActiveResetToken] = useState('');

  // New Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  // Load registered recovery phone on mount
  useEffect(() => {
    const account = adminAuthService.getAdminAccount();
    const normalized = normalizePakistaniPhone(account.recoveryPhone);
    setRecoveryPhoneDisplay(account.recoveryPhone);
    setRecoveryNormalizedDisplay(normalized.formattedDisplay);
  }, [isOpen]);

  // Handle OTP countdown timers
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (mode === 'forgot' && recoveryStep === 'verify') {
      timer = setInterval(() => {
        setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        setOtpExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mode, recoveryStep]);

  if (!isOpen) return null;

  // 1. Handle Admin Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const result = await adminAuthService.verifyAdminLogin(
        loginEmail,
        loginPassword,
        rememberMe
      );

      if (result.success) {
        setLoginSuccessNotice('Authentication verified. Loading Atelier Studio...');
        setTimeout(() => {
          onLoginSuccess();
        }, 400);
      } else {
        setLoginError(result.message);
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // 2. Handle OTP Request via WhatsApp or SMS
  const handleRequestOTP = (channel: 'whatsapp' | 'sms') => {
    setOtpError('');
    setSelectedChannel(channel);

    const result = adminAuthService.requestPasswordRecoveryOTP(recoveryIdentifier, channel);
    if (result.success) {
      setRecoveryStep('verify');
      setOtpCooldown(60);
      setOtpExpiresIn(300);
      setOtpInput('');
      setRecoveryWhatsAppUrl(result.whatsAppDirectUrl);
      setRecoverySmsUrl(result.smsDirectUrl);
    } else {
      setOtpError(result.message);
    }
  };

  // 3. Handle OTP Code Verification
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);

    try {
      const result = adminAuthService.verifyRecoveryOTP(otpInput);
      if (result.success && result.resetToken) {
        setActiveResetToken(result.resetToken);
        setRecoveryStep('new_password');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setOtpError(result.message);
      }
    } catch (err: any) {
      setOtpError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // 4. Handle Save New Password
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    setResetLoading(true);
    try {
      const result = await adminAuthService.resetPasswordWithToken(
        activeResetToken,
        newPassword
      );

      if (result.success) {
        setLoginPassword(newPassword);
        setLoginSuccessNotice('Password reset successfully! Please log in with your new password.');
        setMode('login');
        setRecoveryStep('request');
      } else {
        setResetError(result.message);
      }
    } catch (err: any) {
      setResetError(err?.message || 'Error saving new password. Please retry.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full border-2 border-[#C49A6C] shadow-2xl overflow-hidden my-8">
        {/* Brand Header Banner */}
        <div className="bg-[#42240D] text-[#FAF7F2] px-8 py-7 relative text-center border-b-2 border-[#C49A6C]">
          <div className="w-14 h-14 rounded-2xl bg-[#5C3A21] border border-[#C49A6C] flex items-center justify-center mx-auto mb-3 shadow-md">
            <Diamond className="w-7 h-7 text-[#FECF9D]" />
          </div>

          <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#C49A6C] block">
            ESTD 2023 · HAUTE COUTURE &amp; PRET
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider uppercase text-white mt-1">
            SAHARISH
          </h2>
          <p className="text-xs text-[#FAF7F2]/80 mt-1 font-serif italic">
            Atelier Administrative Management &amp; Security Portal
          </p>

          {/* Close / Return to Store button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-[#FAF7F2]/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Return to Boutique Store"
          >
            <Store className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Success Notification Alert */}
          {loginSuccessNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{loginSuccessNotice}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: ADMIN LOGIN SCREEN                                */}
          {/* ======================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#42240D]">
                    Administrator Sign In
                  </h3>
                  <p className="text-xs text-[#82746C]">
                    Enter authorized credentials to access catalog and orders.
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-[#EBE8E3] border border-[#D4C3B9] text-[9px] uppercase font-bold text-[#5C3A21] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-bit Encrypted</span>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Admin Email Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#42240D] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#7A582F]" />
                  <span>Admin Email / Gmail</span>
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="saharishcollection.com.pk@gmail.com"
                  className="w-full bg-white text-[#1C1C19] border border-[#D4C3B9] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5C3A21] focus:ring-1 focus:ring-[#5C3A21] transition-all"
                />
              </div>

              {/* Admin Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#42240D] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#7A582F]" />
                    <span>Admin Password</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setRecoveryStep('request');
                      setLoginError('');
                    }}
                    className="text-xs font-bold text-[#7A582F] hover:text-[#42240D] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white text-[#1C1C19] border border-[#D4C3B9] rounded-xl pl-3.5 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#5C3A21] focus:ring-1 focus:ring-[#5C3A21] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#82746C] hover:text-[#42240D]"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Security Policy */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#50443D] select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#D4C3B9] text-[#5C3A21] focus:ring-[#5C3A21]"
                  />
                  <span>Remember this device</span>
                </label>
                <span className="text-[10px] text-[#82746C]">Never share admin access</span>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                <span>{loginLoading ? 'Authenticating...' : 'Log In to Atelier'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Registered Admin Notice */}
              <div className="p-3 bg-[#F0EDE9] rounded-xl border border-[#D4C3B9]/60 text-[11px] text-[#50443D] space-y-1">
                <div className="font-bold text-[#42240D] flex items-center justify-between">
                  <span>Registered Atelier Recovery Phone:</span>
                  <span className="font-mono text-[#5C3A21]">{recoveryPhoneDisplay} (+92)</span>
                </div>
                <p className="text-[10px] text-[#82746C]">
                  If password is forgotten, use the "Forgot Password?" button above to receive a secure OTP via WhatsApp or SMS.
                </p>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 2: FORGOT PASSWORD & OTP RECOVERY                    */}
          {/* ======================================================== */}
          {mode === 'forgot' && (
            <div className="space-y-5">
              {/* Step Navigation Header */}
              <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (recoveryStep === 'verify') setRecoveryStep('request');
                      else setMode('login');
                    }}
                    className="p-1 rounded-lg text-[#82746C] hover:text-[#42240D] hover:bg-[#EBE8E3]"
                    title="Back"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <h3 className="font-serif text-base font-bold text-[#42240D]">
                    {recoveryStep === 'request' && 'Admin Password Recovery'}
                    {recoveryStep === 'verify' && 'Enter Verification Code'}
                    {recoveryStep === 'new_password' && 'Create New Password'}
                  </h3>
                </div>

                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#7A582F]">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      recoveryStep === 'request' ? 'bg-[#5C3A21]' : 'bg-[#D4C3B9]'
                    }`}
                  ></span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      recoveryStep === 'verify' ? 'bg-[#5C3A21]' : 'bg-[#D4C3B9]'
                    }`}
                  ></span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      recoveryStep === 'new_password' ? 'bg-[#5C3A21]' : 'bg-[#D4C3B9]'
                    }`}
                  ></span>
                </div>
              </div>

              {/* RECOVERY STEP 1: IDENTITY & CHANNEL SELECTION */}
              {recoveryStep === 'request' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#50443D] leading-relaxed">
                    Verify your registered account identity. We will dispatch a secure 6-digit one-time code to your registered recovery number.
                  </p>

                  {otpError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#42240D]">
                      Admin Email / Identity
                    </label>
                    <input
                      type="text"
                      value={recoveryIdentifier}
                      onChange={(e) => setRecoveryIdentifier(e.target.value)}
                      placeholder="saharishcollection.com.pk@gmail.com"
                      className="w-full bg-white text-[#1C1C19] border border-[#D4C3B9] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5C3A21] focus:ring-1 focus:ring-[#5C3A21]"
                    />
                  </div>

                  {/* Registered Admin Line Display Card */}
                  <div className="p-3.5 rounded-2xl bg-[#F0EDE9] border border-[#D4C3B9] space-y-1">
                    <div className="text-[10px] uppercase font-bold text-[#82746C] tracking-wider">
                      Registered Admin Recovery Destination
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-[#42240D]">
                        {recoveryPhoneDisplay} ({recoveryNormalizedDisplay})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FECF9D] text-[#79562E] font-bold uppercase">
                        Pakistan (+92)
                      </span>
                    </div>
                    <p className="text-[10px] text-[#82746C] pt-1">
                      OTP will be delivered directly to this verified device. Your current password is never exposed.
                    </p>
                  </div>

                  {/* Two Buttons: Send OTP via WhatsApp and Send OTP via SMS */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#42240D] block">
                      Choose Delivery Gateway:
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRequestOTP('whatsapp')}
                      className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-between shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Send OTP via WhatsApp</span>
                      </div>
                      <span className="text-[10px] bg-black/15 px-2 py-0.5 rounded-md font-mono">
                        Official API
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRequestOTP('sms')}
                      className="w-full py-3 px-4 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-between shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4" />
                        <span>Send OTP via SMS</span>
                      </div>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-mono">
                        Direct SIM Gateway
                      </span>
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-[#7A582F] hover:text-[#42240D] hover:underline font-bold"
                    >
                      Return to Admin Login
                    </button>
                  </div>
                </div>
              )}

              {/* RECOVERY STEP 2: VERIFY OTP SCREEN */}
              {recoveryStep === 'verify' && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="p-3 bg-[#F0EDE9] rounded-xl border border-[#D4C3B9] text-xs text-[#50443D] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#42240D]">
                        Verification Code Dispatched
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#25D366]">
                        {selectedChannel === 'whatsapp' ? 'WhatsApp Business' : 'Telecom SMS'}
                      </span>
                    </div>
                    <p className="text-[11px]">
                      Enter the 6-digit code sent to{' '}
                      <strong className="font-mono text-[#42240D]">{recoveryNormalizedDisplay}</strong>.
                    </p>
                  </div>

                  {otpError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  {/* 6-Digit Code Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#42240D] flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-[#7A582F]" />
                        <span>Enter 6-Digit OTP</span>
                      </label>
                      <span className="text-[10px] text-[#82746C] font-mono">
                        Expires in: {Math.floor(otpExpiresIn / 60)}:
                        {(otpExpiresIn % 60).toString().padStart(2, '0')}
                      </span>
                    </div>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      autoFocus
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.4em] font-mono text-2xl font-bold py-3 bg-white border-2 border-[#C49A6C] rounded-xl text-[#42240D] focus:outline-none focus:ring-2 focus:ring-[#5C3A21]"
                    />
                  </div>

                  {/* Direct Launch Buttons to Test Real External Messaging */}
                  {selectedChannel === 'whatsapp' && recoveryWhatsAppUrl && (
                    <div className="pt-1">
                      <a
                        href={recoveryWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#128C7E] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>Open Verified WhatsApp Chat ({recoveryPhoneDisplay})</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}

                  {/* Submit Verify Button */}
                  <button
                    type="submit"
                    disabled={otpLoading || otpInput.length !== 6}
                    className="w-full py-3 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                  >
                    <span>{otpLoading ? 'Verifying...' : 'Verify OTP Code'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  {/* Resend OTP Options */}
                  <div className="pt-2 border-t border-[#E5E2DD] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <span className="text-[#82746C] text-[11px]">Didn't receive code?</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={otpCooldown > 0}
                        onClick={() => handleRequestOTP('whatsapp')}
                        className="text-[#25D366] hover:underline font-bold disabled:opacity-40 disabled:no-underline"
                      >
                        Resend WhatsApp {otpCooldown > 0 && `(${otpCooldown}s)`}
                      </button>
                      <span className="text-[#D4C3B9]">·</span>
                      <button
                        type="button"
                        disabled={otpCooldown > 0}
                        onClick={() => handleRequestOTP('sms')}
                        className="text-[#5C3A21] hover:underline font-bold disabled:opacity-40 disabled:no-underline"
                      >
                        Resend SMS {otpCooldown > 0 && `(${otpCooldown}s)`}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* RECOVERY STEP 3: CREATE NEW PASSWORD */}
              {recoveryStep === 'new_password' && (
                <form onSubmit={handleSaveNewPassword} className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>OTP Verified! Set your new administrator password.</span>
                  </div>

                  {resetError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#42240D] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#7A582F]" />
                      <span>New Admin Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-white text-[#1C1C19] border border-[#D4C3B9] rounded-xl pl-3.5 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#5C3A21] focus:ring-1 focus:ring-[#5C3A21] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#82746C] hover:text-[#42240D]"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#42240D] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#7A582F]" />
                      <span>Confirm New Password</span>
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-white text-[#1C1C19] border border-[#D4C3B9] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#5C3A21] focus:ring-1 focus:ring-[#5C3A21] font-mono"
                    />
                  </div>

                  <p className="text-[10px] text-[#82746C]">
                    Your new password will be hashed and salted before storing. The old password will be invalidated immediately.
                  </p>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                  >
                    <span>{resetLoading ? 'Saving...' : 'Update & Save Admin Password'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Security Footer Note */}
        <div className="px-6 py-4 bg-[#F0EDE9] border-t border-[#D4C3B9] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#82746C]">
          <span>SAHARISH Atelier Security Policy</span>
          <span>Official Meta Cloud API · Direct SIM Carrier</span>
        </div>
      </div>
    </div>
  );
};

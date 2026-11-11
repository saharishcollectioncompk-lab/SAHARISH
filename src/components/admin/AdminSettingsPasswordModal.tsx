import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  ShieldAlert,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  MessageCircle,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { adminAuthService, normalizePakistaniPhone } from '../../services/adminAuthService';

interface AdminSettingsPasswordModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
  targetSectionName?: string;
}

export const AdminSettingsPasswordModal: React.FC<AdminSettingsPasswordModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  targetSectionName = 'Admin Settings & Security',
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Settings Password Flow
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'channel' | 'otp' | 'new-password'>('channel');
  const [recoveryChannel, setRecoveryChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [otpInput, setOtpInput] = useState('');
  const [newSettingsPassword, setNewSettingsPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recoveryFeedback, setRecoveryFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await adminAuthService.verifyAdminSettingsPassword(passwordInput);
      if (result.success) {
        setPasswordInput('');
        onSuccess();
      } else {
        setErrorMessage(result.message || 'Incorrect Admin Settings Password. Access denied.');
      }
    } catch {
      setErrorMessage('An error occurred while verifying password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRecoveryOTP = async (channel: 'whatsapp' | 'sms') => {
    setRecoveryChannel(channel);
    setIsLoading(true);
    setRecoveryFeedback(null);

    const admin = adminAuthService.getAdminAccount();
    const result = adminAuthService.requestPasswordRecoveryOTP(admin.email, channel);

    setIsLoading(false);
    if (result.success) {
      setRecoveryFeedback({
        type: 'success',
        text: `OTP sent to your registered ${channel === 'whatsapp' ? 'WhatsApp' : 'mobile'} number.`,
      });
      setRecoveryStep('otp');
    } else {
      setRecoveryFeedback({
        type: 'error',
        text: result.message || 'Failed to dispatch recovery OTP. Please try again.',
      });
    }
  };

  const handleVerifyRecoveryOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) return;

    setIsLoading(true);
    setRecoveryFeedback(null);

    const result = adminAuthService.verifyRecoveryOTP(otpInput);
    setIsLoading(false);

    if (result.success && result.resetToken) {
      setVerifiedToken(result.resetToken);
      setRecoveryStep('new-password');
      setRecoveryFeedback({
        type: 'success',
        text: 'OTP verified successfully. Create your new Admin Settings Password.',
      });
    } else {
      setRecoveryFeedback({
        type: 'error',
        text: result.message || 'Incorrect verification code. Please check your phone.',
      });
    }
  };

  const handleSaveNewSettingsPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSettingsPassword.length < 6) {
      setRecoveryFeedback({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newSettingsPassword !== confirmNewPassword) {
      setRecoveryFeedback({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsLoading(true);
    // Overwrite master settings password record
    const account = adminAuthService.getAdminAccount();
    const normalized = normalizePakistaniPhone(account.recoveryPhone);
    const newSalt = 'sah_settings_salt_' + Math.random().toString(36).substring(2, 10);
    
    // Hash using window.crypto
    let hash = '';
    try {
      const enc = new TextEncoder();
      const buf = await crypto.subtle.digest(
        'SHA-256',
        enc.encode(`${newSalt}:${newSettingsPassword.trim()}:saharish_secure_couture_salt_2025`)
      );
      hash = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      hash = newSettingsPassword.trim();
    }

    localStorage.setItem(
      'saharish_admin_settings_password_v1',
      JSON.stringify({ salt: newSalt, passwordHash: hash })
    );

    adminAuthService.unlockAdminSettings();
    setIsLoading(false);

    setRecoveryFeedback({
      type: 'success',
      text: 'Admin Settings Password changed successfully!',
    });

    setTimeout(() => {
      setIsForgotMode(false);
      setRecoveryStep('channel');
      setPasswordInput('');
      onSuccess();
    }, 1200);
  };

  const recoveryPhoneDisplay = normalizePakistaniPhone(
    adminAuthService.getAdminAccount().recoveryPhone
  ).formattedDisplay;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 border border-[#C49A6C]/50 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#82746C] hover:text-[#42240D] p-1 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#5C3A21] text-[#C49A6C] flex items-center justify-center shadow-md shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
                Security Gateway
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#42240D]">
              Admin Settings Password
            </h3>
            <p className="text-[11px] text-[#82746C]">
              Accessing {targetSectionName}
            </p>
          </div>
        </div>

        {/* Normal Password Verification Flow */}
        {!isForgotMode ? (
          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#D4C3B9]/60 text-xs text-[#50443D] leading-relaxed">
              <p>
                This administrative section contains critical contact, OTP gateway, and phone configurations. Please enter your private <strong>Admin Settings Password</strong> to continue.
              </p>
              <p className="text-[10px] text-[#82746C] mt-1.5 italic">
                (Default: <code className="bg-white px-1.5 py-0.5 rounded border border-[#D4C3B9] font-mono text-[#42240D]">AdminSettings@2025</code> or your custom password)
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1.5">
                Master Settings Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter settings password..."
                  required
                  autoFocus
                  className="w-full pl-3.5 pr-10 py-3 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] focus:outline-none focus:border-[#5C3A21] focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#82746C] hover:text-[#42240D]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !passwordInput.trim()}
              className="w-full py-3 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 text-[#C49A6C]" />
              <span>{isLoading ? 'Verifying...' : 'Unlock Admin Settings'}</span>
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-[#F0EDE9] text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(true);
                  setRecoveryStep('channel');
                  setRecoveryFeedback(null);
                }}
                className="text-[#7A582F] hover:text-[#42240D] font-bold text-[11px] underline"
              >
                Forgot Settings Password?
              </button>
              <span className="text-[10px] text-[#82746C]">
                Auto-locks after 15m
              </span>
            </div>
          </form>
        ) : (
          /* Forgot Settings Password OTP Recovery Flow */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EDE9]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#42240D]">
                Reset Settings Password
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false);
                  setRecoveryFeedback(null);
                }}
                className="text-xs text-[#7A582F] hover:underline"
              >
                Back to Password
              </button>
            </div>

            {recoveryFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  recoveryFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {recoveryFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{recoveryFeedback.text}</span>
              </div>
            )}

            {/* Step 1: Choose Channel */}
            {recoveryStep === 'channel' && (
              <div className="space-y-3">
                <p className="text-xs text-[#50443D]">
                  Send a secure verification code to your verified administrator number:
                </p>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D4C3B9] text-xs font-mono font-bold text-[#42240D]">
                  {recoveryPhoneDisplay}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSendRecoveryOTP('whatsapp')}
                    disabled={isLoading}
                    className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>WhatsApp OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendRecoveryOTP('sms')}
                    disabled={isLoading}
                    className="py-2.5 px-3 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#C49A6C]" />
                    <span>Direct SMS OTP</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Enter OTP (Privacy Preserved - Never displays code) */}
            {recoveryStep === 'otp' && (
              <form onSubmit={handleVerifyRecoveryOTP} className="space-y-3">
                <div className="text-xs text-[#50443D]">
                  Enter the 6-digit verification code received on your {recoveryChannel === 'whatsapp' ? 'WhatsApp' : 'mobile phone'}.
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    required
                    autoFocus
                    className="w-full text-center tracking-[0.5em] text-lg font-mono font-bold py-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-[#42240D] focus:outline-none focus:border-[#5C3A21] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpInput.length < 6}
                  className="w-full py-2.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="flex items-center justify-between pt-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSendRecoveryOTP(recoveryChannel)}
                    className="text-[#7A582F] hover:underline font-semibold"
                  >
                    Resend OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecoveryStep('channel')}
                    className="text-[#82746C] hover:underline"
                  >
                    Change Method
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Set New Password */}
            {recoveryStep === 'new-password' && (
              <form onSubmit={handleSaveNewSettingsPassword} className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                    New Settings Password
                  </label>
                  <input
                    type="password"
                    value={newSettingsPassword}
                    onChange={(e) => setNewSettingsPassword(e.target.value)}
                    placeholder="Min 6 characters..."
                    required
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                    Confirm New Settings Password
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat password..."
                    required
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !newSettingsPassword || !confirmNewPassword}
                  className="w-full py-2.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C49A6C]" />
                  <span>{isLoading ? 'Saving...' : 'Save & Unlock Settings'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

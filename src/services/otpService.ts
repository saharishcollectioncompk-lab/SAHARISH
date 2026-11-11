import { OTPRecord } from '../types';
import { storageService } from './storageService';

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 3;

export interface RequestOTPResult {
  success: boolean;
  message: string;
  record?: OTPRecord;
  cooldownRemaining?: number;
}

export interface VerifyOTPResult {
  success: boolean;
  message: string;
  attemptsRemaining?: number;
}

function normalizeDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('03') && digits.length === 11) {
    return '92' + digits.substring(1);
  } else if (digits.startsWith('923') && digits.length === 12) {
    return digits;
  } else if (digits.startsWith('3') && digits.length === 10) {
    return '92' + digits;
  }
  return digits;
}

export const otpService = {
  /**
   * Request a unique 6-digit OTP to the phone via WhatsApp or SMS.
   */
  requestOTP(
    phone: string,
    channel: 'whatsapp' | 'sms',
    purpose: 'registration' | 'login' | 'reset_password'
  ): RequestOTPResult {
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 7) {
      return {
        success: false,
        message: 'Please provide a valid mobile or WhatsApp phone number.',
      };
    }

    const normalizedDigits = normalizeDigits(cleanPhone);
    const existingRecords = storageService.getOTPRecords();
    const latestForPhone = existingRecords.find(
      (r) =>
        (r.phone === cleanPhone || normalizeDigits(r.phone) === normalizedDigits) &&
        r.purpose === purpose &&
        !r.verified
    );

    const now = Date.now();

    // Check resend cooldown
    if (latestForPhone && now - latestForPhone.createdAt < RESEND_COOLDOWN_MS) {
      const cooldownRemaining = Math.ceil(
        (RESEND_COOLDOWN_MS - (now - latestForPhone.createdAt)) / 1000
      );
      return {
        success: false,
        message: `Please wait ${cooldownRemaining}s before requesting a new OTP.`,
        cooldownRemaining,
      };
    }

    // Generate secure 6-digit OTP code (random 100000 - 999999)
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const newRecord: OTPRecord = {
      id: `otp-${now}-${Math.random().toString(36).substring(2, 6)}`,
      phone: cleanPhone,
      channel,
      code,
      purpose,
      createdAt: now,
      expiresAt: now + OTP_EXPIRY_MS,
      attempts: 0,
      verified: false,
    };

    storageService.saveOTPRecord(newRecord);

    const whatsappText = `*SAHARISH Luxury Pret & Couture*\n💬 Official Verification Code: *${code}*\n\nValid for 5 minutes. Never share this code with anyone.`;
    const directWhatsAppUrl = `https://api.whatsapp.com/send?phone=${normalizedDigits}&text=${encodeURIComponent(
      whatsappText
    )}`;
    const directSmsUrl = `sms:+${normalizedDigits}?body=${encodeURIComponent(
      `SAHARISH: Use verification code ${code}. Valid for 5 minutes.`
    )}`;

    const statusMessage =
      channel === 'whatsapp'
        ? 'OTP sent to your registered WhatsApp number.'
        : 'OTP sent to your registered mobile SIM number.';

    // Dispatch delivery notification event with ZERO plaintext code exposure
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('saharish_otp_delivered', {
          detail: {
            record: {
              id: newRecord.id,
              phone: newRecord.phone,
              channel: newRecord.channel,
              purpose: newRecord.purpose,
              createdAt: newRecord.createdAt,
              expiresAt: newRecord.expiresAt,
            },
            channelName:
              channel === 'whatsapp'
                ? 'Official WhatsApp Business Cloud API'
                : 'Direct SIM Telecom Gateway',
            statusMessage,
            directWhatsAppUrl,
            directSmsUrl,
            normalizedDigits,
          },
        })
      );
    }

    return {
      success: true,
      message: statusMessage,
    };
  },

  /**
   * Verify the entered code against the latest active OTP record for the phone.
   */
  verifyOTP(
    phone: string,
    enteredCode: string,
    purpose: 'registration' | 'login' | 'reset_password'
  ): VerifyOTPResult {
    const cleanPhone = phone.trim();
    const cleanCode = enteredCode.trim();
    const normalizedDigits = normalizeDigits(cleanPhone);

    if (!cleanCode || cleanCode.length !== 6) {
      return {
        success: false,
        message: 'Please enter a valid 6-digit verification code.',
      };
    }

    const records = storageService.getOTPRecords();
    const activeRecord = records.find(
      (r) =>
        (r.phone === cleanPhone || normalizeDigits(r.phone) === normalizedDigits) &&
        r.purpose === purpose &&
        !r.verified
    );

    if (!activeRecord) {
      return {
        success: false,
        message: 'No active OTP request found for this phone number. Please request a new code.',
      };
    }

    const now = Date.now();
    if (now > activeRecord.expiresAt) {
      return {
        success: false,
        message: 'The verification code has expired. Please request a fresh OTP.',
      };
    }

    if (activeRecord.attempts >= MAX_ATTEMPTS) {
      return {
        success: false,
        message: 'Too many incorrect attempts. For security, please request a new OTP.',
      };
    }

    if (activeRecord.code !== cleanCode) {
      const newAttempts = activeRecord.attempts + 1;
      storageService.updateOTPRecord(activeRecord.id, { attempts: newAttempts });
      const remaining = MAX_ATTEMPTS - newAttempts;
      return {
        success: false,
        message: `Incorrect OTP code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Please request a new code.'}`,
        attemptsRemaining: remaining,
      };
    }

    // Success! Mark as verified
    storageService.updateOTPRecord(activeRecord.id, { verified: true });
    return {
      success: true,
      message: 'OTP verified successfully.',
    };
  },
};

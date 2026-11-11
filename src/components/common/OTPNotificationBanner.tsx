import React, { useState, useEffect } from 'react';
import { MessageSquare, Smartphone, CheckCircle, Bell, X, ShieldCheck } from 'lucide-react';
import { OTPRecord } from '../../types';

interface OTPDeliveryDetail {
  record: Pick<OTPRecord, 'id' | 'phone' | 'channel' | 'purpose' | 'createdAt' | 'expiresAt'>;
  channelName: string;
  directWhatsAppUrl?: string;
  directSmsUrl?: string;
  statusMessage: string;
}

interface AdminDeliveryDetail {
  payload: {
    event: string;
    customerName: string;
  };
  dispatchedTo: string[];
}

export const OTPNotificationBanner: React.FC = () => {
  const [activeOTP, setActiveOTP] = useState<OTPDeliveryDetail | null>(null);
  const [adminNotification, setAdminNotification] = useState<AdminDeliveryDetail | null>(null);

  useEffect(() => {
    const handleOTPDelivery = (event: Event) => {
      const customEvent = event as CustomEvent<OTPDeliveryDetail>;
      if (customEvent.detail) {
        setActiveOTP(customEvent.detail);
      }
    };

    const handleAdminNotification = (event: Event) => {
      const customEvent = event as CustomEvent<AdminDeliveryDetail>;
      if (customEvent.detail) {
        setAdminNotification(customEvent.detail);
        setTimeout(() => {
          setAdminNotification(null);
        }, 6000);
      }
    };

    window.addEventListener('saharish_otp_delivered', handleOTPDelivery);
    window.addEventListener('saharish_admin_notification_sent', handleAdminNotification);

    return () => {
      window.removeEventListener('saharish_otp_delivered', handleOTPDelivery);
      window.removeEventListener('saharish_admin_notification_sent', handleAdminNotification);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full px-4 sm:px-0 pointer-events-none">
      {/* Real-time Delivery Privacy Notification (Code is NEVER revealed on screen) */}
      {activeOTP && (
        <div className="pointer-events-auto bg-[#FFFFFF] rounded-2xl shadow-2xl border-2 border-[#C49A6C] p-4 text-[#1C1C19] space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-[#F0EDE9]">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm ${
                  activeOTP.record.channel === 'whatsapp' ? 'bg-[#25D366]' : 'bg-[#5C3A21]'
                }`}
              >
                {activeOTP.record.channel === 'whatsapp' ? (
                  <MessageSquare className="w-4 h-4" />
                ) : (
                  <Smartphone className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#25D366]">
                    OTP Sent Successfully
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <span className="text-xs font-bold text-[#42240D]">
                  {activeOTP.channelName} · {activeOTP.record.phone}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveOTP(null)}
              className="text-[#82746C] hover:text-[#42240D] p-1 rounded-full transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#D4C3B9]/50 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#42240D]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Private Device Delivery</span>
            </div>
            <p className="text-xs text-[#50443D] leading-relaxed font-sans">
              {activeOTP.statusMessage ||
                'A secure verification code has been dispatched directly to your registered device. Please check your WhatsApp or SMS inbox.'}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[10px] text-[#82746C] italic">
              Code is delivered strictly to your phone for security.
            </span>

            <div className="flex items-center gap-2">
              {activeOTP.directWhatsAppUrl && activeOTP.record.channel === 'whatsapp' && (
                <a
                  href={activeOTP.directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Open WhatsApp on device"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-white" />
                  <span>Open WhatsApp</span>
                </a>
              )}
              {activeOTP.directSmsUrl && activeOTP.record.channel === 'sms' && (
                <a
                  href={activeOTP.directSmsUrl}
                  className="px-3 py-1.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Open SMS on device"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Open SMS</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setActiveOTP(null)}
                className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EDE9] border border-[#D4C3B9] text-xs font-bold uppercase tracking-wider text-[#42240D] transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notification Alert Toast for Orders and Registrations */}
      {adminNotification && (
        <div className="pointer-events-auto bg-[#42240D] text-[#FAF7F2] rounded-xl shadow-xl border border-[#C49A6C] p-3.5 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#FECF9D]" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C49A6C]">
                Atelier Admin Dispatch Alert
              </span>
            </div>
            <button
              onClick={() => setAdminNotification(null)}
              className="text-[#FAF7F2]/60 hover:text-white p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-xs font-bold text-white">
            {adminNotification.payload.event}: {adminNotification.payload.customerName}
          </div>
          <div className="text-[10px] text-[#FAF7F2]/80 font-mono">
            Dispatched to: {adminNotification.dispatchedTo.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

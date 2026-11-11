import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, PhoneCall } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { normalizePakistaniPhone } from '../../services/adminAuthService';

interface WhatsAppFloatingButtonProps {
  currentProductTitle?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  currentProductTitle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inquiryText, setInquiryText] = useState('');
  const settings = storageService.getAdminSettings();

  // Official Pakistani number format for wa.me link (+92 309 7309810 -> 923097309810)
  const officialNumberDigits = normalizePakistaniPhone(settings.officialWhatsAppNumber || '03097309810').normalizedDigits;

  const defaultPrompt = currentProductTitle
    ? `Salam SAHARISH Concierge, I would like to inquire about the ${currentProductTitle}. Is it available for immediate dispatch?`
    : `Salam SAHARISH Concierge! I would like to inquire about your ladies' luxury pret & festive collection.`;

  const handleStartChat = (customMessage?: string) => {
    const textToSend = encodeURIComponent(customMessage || inquiryText || defaultPrompt);
    const whatsappUrl = `https://wa.me/${officialNumberDigits}?text=${textToSend}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Quick Interactive Concierge Drawer */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#C49A6C]/40 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#5C3A21] to-[#42240D] p-4 text-[#FAF7F2] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/apple-touch-icon.png"
                  alt="SAHARISH Concierge"
                  className="w-10 h-10 rounded-full border-2 border-[#C49A6C] object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#42240D] animate-pulse"></span>
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#FAF7F2] tracking-wide">
                  SAHARISH Concierge Desk
                </h4>
                <div className="text-[11px] text-[#F7E7E0]/90 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Official Stylist Online · Typically replies in &lt;5 mins</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-[#F7E7E0] hover:bg-white/10 transition-colors"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-[#FAF7F2]">
            <div className="p-3 rounded-xl bg-white border border-[#D4C3B9]/50 shadow-sm text-xs text-[#50443D] space-y-1">
              <p className="font-medium text-[#42240D]">
                Welcome to SAHARISH Luxury Pret &amp; Haute Couture!
              </p>
              <p className="text-[11px] text-[#82746C]">
                How may our Master Tailor and Styling Concierge assist you today?
              </p>
            </div>

            {/* Quick Inquiry Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A582F]">
                Quick Inquiries
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() =>
                    handleStartChat(
                      `Salam, I'd like to consult on bespoke measurements & unstitched tailoring for festive pret.`
                    )
                  }
                  className="w-full text-left p-2 rounded-lg bg-white hover:bg-[#F7E7E0] border border-[#D4C3B9]/40 text-xs text-[#42240D] transition-colors flex items-center justify-between group"
                >
                  <span>👗 Bespoke Sizing &amp; Tailoring Consultation</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#C49A6C] group-hover:scale-110" />
                </button>
                <button
                  onClick={() =>
                    handleStartChat(
                      `Salam! Could you please share the live courier tracking update for my SAHARISH order?`
                    )
                  }
                  className="w-full text-left p-2 rounded-lg bg-white hover:bg-[#F7E7E0] border border-[#D4C3B9]/40 text-xs text-[#42240D] transition-colors flex items-center justify-between group"
                >
                  <span>📦 Track Parcel &amp; Global Delivery</span>
                  <PhoneCall className="w-3.5 h-3.5 text-[#C49A6C] group-hover:scale-110" />
                </button>
              </div>
            </div>

            {/* Custom Input */}
            <div className="pt-2">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7A582F] mb-1">
                Custom Message
              </label>
              <div className="relative">
                <textarea
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  placeholder={defaultPrompt}
                  rows={2}
                  className="w-full p-2.5 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] placeholder:text-[#82746C]/60 focus:outline-none focus:border-[#5C3A21] resize-none"
                />
              </div>
            </div>

            <button
              onClick={() => handleStartChat()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#1EBE5D] hover:to-[#0E7A6E] text-white font-semibold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Open WhatsApp Chat</span>
              <Send className="w-3.5 h-3.5" />
            </button>

            <div className="text-[10px] text-center text-[#82746C]">
              Official Stylist Hotline: <span className="font-semibold text-[#42240D]">{settings.officialWhatsAppNumber}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat with SAHARISH on WhatsApp"
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-2xl hover:shadow-[0_10px_25px_rgba(37,211,102,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-white stroke-none" />
        <span className="hidden sm:inline font-sans text-xs font-bold uppercase tracking-wider">
          WhatsApp Styling
        </span>
      </button>
    </div>
  );
};

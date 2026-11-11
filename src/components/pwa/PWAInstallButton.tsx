import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, CheckCircle2, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'mobile' | 'floating' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccessToast, setInstallSuccessToast] = useState(false);

  // If already running in standalone or installed, hide the button per prompt requirement
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (isInstallable) {
      const accepted = await installApp();
      if (accepted) {
        setInstallSuccessToast(true);
        setTimeout(() => setInstallSuccessToast(false), 4000);
      }
    } else {
      // In browsers where beforeinstallprompt isn't fired yet or desktop Safari/Firefox,
      // show helpful interactive install guide
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          aria-label="Install SAHARISH App"
          className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border border-[#C49A6C]/40 bg-gradient-to-r from-[#5C3A21] to-[#42240D] text-[#FAF7F2] hover:shadow-md hover:from-[#7E4F2D] hover:to-[#5C3A21] hover:border-[#C49A6C] ${className}`}
        >
          <span className="p-1 rounded-full bg-[#C49A6C]/25 text-[#F7E7E0] group-hover:scale-110 transition-transform">
            <Download className="w-3.5 h-3.5" />
          </span>
          <span className="font-sans">Install App</span>
        </button>
      )}

      {variant === 'mobile' && (
        <button
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-[#5C3A21] to-[#42240D] text-[#FAF7F2] shadow-md border border-[#C49A6C]/40 active:scale-[0.98] transition-transform ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#C49A6C]/20 border border-[#C49A6C]/40 flex items-center justify-center text-[#F7E7E0]">
              <Download className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-[#FAF7F2]">
                Install SAHARISH App
              </div>
              <div className="text-[11px] text-[#F7E7E0]/80">
                Fast luxury mobile shopping &amp; offline access
              </div>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-[#C49A6C] text-[#42240D]">
            Install
          </span>
        </button>
      )}

      {variant === 'floating' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-full bg-[#FAF7F2] text-[#42240D] border border-[#C49A6C]/50 shadow-lg hover:shadow-xl hover:bg-[#F7E7E0] transition-all text-xs font-semibold uppercase tracking-wider ${className}`}
        >
          <Download className="w-4 h-4 text-[#5C3A21]" />
          <span>Install App</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className={`p-4 rounded-xl bg-[#FAF7F2] border border-[#C49A6C]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <img
              src="/apple-touch-icon.png"
              alt="SAHARISH App Icon"
              className="w-11 h-11 rounded-xl shadow-sm object-cover border border-[#C49A6C]/30"
            />
            <div>
              <h4 className="text-sm font-serif font-bold text-[#42240D]">SAHARISH Official App</h4>
              <p className="text-xs text-[#50443D]">Install for seamless bespoke ordering, offline viewing &amp; instant alerts.</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 rounded-lg bg-[#5C3A21] hover:bg-[#42240D] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-[#C49A6C]" />
            <span>Install Now</span>
          </button>
        </div>
      )}

      {/* iOS & Browser Fallback Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1C19]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#C49A6C]/40 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#82746C] hover:text-[#42240D] hover:bg-[#E5E2DD] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden shadow-md border border-[#C49A6C]/40 p-1 bg-white">
                <img
                  src="/apple-touch-icon.png"
                  alt="SAHARISH Crest"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F] block">
                Progressive Web App
              </span>
              <h3 className="font-serif text-xl font-bold text-[#42240D]">
                Install SAHARISH on Your Device
              </h3>
              <p className="text-xs text-[#50443D] leading-relaxed">
                Enjoy a full native app experience with rapid loading, offline lookbook access, and instant pret concierge.
              </p>
            </div>

            <div className="bg-[#FFFFFF] rounded-xl p-4 border border-[#D4C3B9]/50 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#F7E7E0] text-[#5C3A21] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  1
                </div>
                <div className="text-xs text-[#50443D]">
                  Tap the <strong className="text-[#42240D] inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 text-[#5C3A21]" /> Share</strong> icon in your browser menu (bottom on iPhone / top right on iPad).
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#F7E7E0] text-[#5C3A21] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  2
                </div>
                <div className="text-xs text-[#50443D]">
                  Scroll down the action list and select <strong className="text-[#42240D] inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-[#5C3A21]" /> Add to Home Screen</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#F7E7E0] text-[#5C3A21] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  3
                </div>
                <div className="text-xs text-[#50443D]">
                  Tap <strong className="text-[#42240D]">Add</strong> in the top-right corner. The official SAHARISH icon will appear on your home screen!
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-3 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-[#FAF7F2] text-xs uppercase font-bold tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Understood</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {installSuccessToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#42240D] text-[#FAF7F2] px-5 py-3 rounded-full shadow-2xl border border-[#C49A6C] flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-[#C49A6C]" />
          <span>SAHARISH App successfully installed to your home screen!</span>
        </div>
      )}
    </>
  );
};

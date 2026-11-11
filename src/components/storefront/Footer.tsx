import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Instagram,
  Facebook,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface FooterProps {
  onNavigate: (view: 'store' | 'auth' | 'admin') => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCategory }) => {
  const settings = storageService.getAdminSettings();

  return (
    <footer className="bg-[#42240D] text-[#FAF7F2] border-t border-[#C49A6C]/40 pt-16 pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Manifesto */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/apple-touch-icon.png"
                alt="SAHARISH Crest"
                className="w-10 h-10 rounded-full border border-[#C49A6C] p-0.5 object-cover"
              />
              <div>
                <span className="font-serif text-2xl font-bold uppercase tracking-wider text-white">
                  SAHARISH
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#C49A6C] block font-semibold">
                  ESTD 2023 · Haute Pret
                </span>
              </div>
            </div>

            <p className="text-xs text-[#FAF7F2]/80 leading-relaxed font-sans">
              Dedicated exclusively to ladies' luxury pret, festive haute couture, and artisanal unstitched collections. Designed with timeless elegance and hand-embroidered heritage craft.
            </p>

            <div className="pt-1">
              <PWAInstallButton variant="header" className="!bg-[#5C3A21] !border-[#C49A6C]" />
            </div>
          </div>

          {/* Quick Curations */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#C49A6C]">
              Couture Capsules
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF7F2]/85">
              {storageService
                .getCollections(false)
                .filter((c) => c.visible !== false && !c.isDeleted)
                .slice(0, 5)
                .map((col) => (
                  <li key={col.id}>
                    <button
                      onClick={() => onSelectCategory(col.name)}
                      className="hover:text-[#C49A6C] transition-colors text-left"
                    >
                      {col.name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* Client Care & Hotlines */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#C49A6C]">
              Atelier Client Desk
            </h4>
            <div className="space-y-2.5 text-xs text-[#FAF7F2]/85">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C49A6C] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Primary Stylist Line:</div>
                  <div className="text-[11px] font-mono text-[#FAF7F2]/80">{settings.adminPhone1.number}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C49A6C] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Secondary Dispatch Desk:</div>
                  <div className="text-[11px] font-mono text-[#FAF7F2]/80">{settings.adminPhone2.number}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#C49A6C] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Official Communications:</div>
                  <div className="text-[11px] text-[#FAF7F2]/80">{settings.officialEmail}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C49A6C] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#FAF7F2]/80">
                  Flagship Boutique, Phase 5 DHA, Lahore, Pakistan
                </div>
              </div>
            </div>
          </div>

          {/* Verified Social Channels & Portal */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#C49A6C]">
              Social &amp; Concierge
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[#FAF7F2]/80 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#C49A6C]" />
                <span>Instagram: {settings.instagram}</span>
              </a>

              <a
                href={`https://facebook.com/${settings.facebook.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[#FAF7F2]/80 hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4 text-[#C49A6C]" />
                <span>Facebook: {settings.facebook}</span>
              </a>

              <a
                href={`https://tiktok.com/@${settings.tiktok.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[#FAF7F2]/80 hover:text-white transition-colors"
              >
                <span className="w-4 h-4 flex items-center justify-center font-bold text-xs text-[#C49A6C]">
                  ♪
                </span>
                <span>TikTok: {settings.tiktok}</span>
              </a>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => onNavigate('admin')}
                className="text-left text-xs text-[#C49A6C] hover:underline flex items-center gap-1 font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Atelier Curator Administration Portal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF7F2]/70">
          <div>
            © {new Date().getFullYear()} SAHARISH (ESTD 2023). Ladies' Clothing Only. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>WhatsApp &amp; SMS OTP Verified</span>
            <span>·</span>
            <span>256-Bit Encrypted Portal</span>
            <span>·</span>
            <span>Leopards Express &amp; TCS Logistics</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

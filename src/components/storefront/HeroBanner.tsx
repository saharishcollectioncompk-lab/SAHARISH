import React from 'react';
import { ShieldCheck, Sparkles, Truck, Headphones, ArrowRight, MessageCircle } from 'lucide-react';

interface HeroBannerProps {
  onShopNow: () => void;
  onOpenConcierge: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopNow, onOpenConcierge }) => {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Main Luxury Hero Canvas */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-[#42240D] via-[#5C3A21] to-[#311807] text-[#FAF7F2] min-h-[420px] md:min-h-[500px] flex flex-col justify-between p-6 sm:p-12 border border-[#C49A6C]/40">
        {/* Subtle Luxury Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C49A6C_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C49A6C]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FECF9D]/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Top Monogram Ribbon */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C49A6C] animate-pulse"></span>
            <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.25em] text-[#C49A6C]">
              Spring/Summer 2025 · Volume I
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-white/10 text-[#FAF7F2] border border-[#C49A6C]/40 text-[10px] uppercase font-bold tracking-widest backdrop-blur-sm">
            Ladies' Pret &amp; Couture
          </span>
        </div>

        {/* Center Editorial Narrative */}
        <div className="relative z-10 max-w-2xl space-y-4 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2]/10 backdrop-blur-md border border-[#C49A6C]/30 text-[#F7E7E0] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#C49A6C]" />
            <span>Master Handloom Silk &amp; Organza Cutwork</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#FAF7F2] leading-[1.15]">
            SAHARISH
            <span className="block font-serif text-xl sm:text-2xl lg:text-3xl font-normal text-[#F7E7E0] italic mt-2">
              Style · Quality · Elegance
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[#FAF7F2]/85 font-sans leading-relaxed max-w-xl">
            Heirloom resham hand embroidery, bespoke raw silk tailoring, and ethereal organza dupattas. Every silhouette is crafted to accentuate feminine grace.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onShopNow}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C49A6C] to-[#A27B4E] hover:from-[#D4A484] hover:to-[#C49A6C] text-[#2F1502] font-bold text-xs uppercase tracking-wider shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenConcierge}
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF7F2] border border-white/20 font-semibold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 backdrop-blur-sm"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Stylist</span>
            </button>
          </div>
        </div>

        {/* Bottom Trust Ribbon (Matches Screenshot 3) */}
        <div className="relative z-10 border-t border-white/15 pt-4 mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold tracking-wider text-[#FAF7F2]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#C49A6C]/25 text-[#F7E7E0] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="uppercase font-bold text-[11px] text-white">Trusted Brand</div>
              <div className="text-[10px] text-[#F7E7E0]/70 font-normal">ESTD 2023 Original</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#C49A6C]/25 text-[#F7E7E0] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="uppercase font-bold text-[11px] text-white">Premium Quality</div>
              <div className="text-[10px] text-[#F7E7E0]/70 font-normal">Pure Handloom Silks</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#C49A6C]/25 text-[#F7E7E0] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="uppercase font-bold text-[11px] text-white">Fast Delivery</div>
              <div className="text-[10px] text-[#F7E7E0]/70 font-normal">Tracked Leopards &amp; TCS</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#C49A6C]/25 text-[#F7E7E0] flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="uppercase font-bold text-[11px] text-white">24/7 Concierge</div>
              <div className="text-[10px] text-[#F7E7E0]/70 font-normal">VIP WhatsApp Hotline</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

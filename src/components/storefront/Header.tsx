import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Shield,
  Menu,
  X,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { CustomerUser, CartItem } from '../../types';
import { storageService } from '../../services/storageService';

interface HeaderProps {
  currentView: 'store' | 'auth' | 'admin';
  onNavigate: (view: 'store' | 'auth' | 'admin') => void;
  customer: CustomerUser | null;
  cartItems: CartItem[];
  wishlistCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  customer,
  cartItems,
  wishlistCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCollections, setActiveCollections] = useState(() =>
    storageService
      .getCollections(false)
      .filter((c) => c.visible !== false && !c.isDeleted)
  );

  useEffect(() => {
    const handleCollectionsUpdated = () => {
      setActiveCollections(
        storageService
          .getCollections(false)
          .filter((c) => c.visible !== false && !c.isDeleted)
      );
    };
    window.addEventListener('saharish_collections_updated', handleCollectionsUpdated);
    return () => {
      window.removeEventListener('saharish_collections_updated', handleCollectionsUpdated);
    };
  }, []);

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  const categories = [
    { id: 'all', label: 'All Silhouettes' },
    ...activeCollections.map((c) => ({ id: c.name, label: c.name })),
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D4C3B9]/50 shadow-sm">
      {/* Top Notification / VIP Banner */}
      <div className="bg-[#42240D] text-[#FAF7F2] text-[11px] py-1.5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-sans tracking-wider uppercase font-semibold text-[10px] text-[#F7E7E0]">
              Lahore Flagship Atelier Online · Express Courier Delivery Across Pakistan &amp; Global
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('admin')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider transition-colors ${
                currentView === 'admin'
                  ? 'bg-[#C49A6C] text-[#2F1502]'
                  : 'bg-white/10 hover:bg-white/20 text-[#FAF7F2]'
              }`}
            >
              <Shield className="w-3 h-3 text-[#C49A6C]" />
              <span>Admin Studio Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Desktop Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#42240D] hover:bg-[#F0EDE9] rounded-xl transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center relative w-64 lg:w-72">
            <Search className="w-4 h-4 text-[#82746C] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search pret or fabric..."
              className="w-full pl-9 pr-3 py-2 bg-[#F6F3EE] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] placeholder:text-[#82746C]/70 focus:outline-none focus:border-[#5C3A21] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 text-xs text-[#82746C] hover:text-[#42240D]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Center: Official Brand Logo & Crest */}
        <div
          onClick={() => onNavigate('store')}
          className="flex flex-col items-center cursor-pointer select-none group text-center"
        >
          <div className="flex items-center gap-2">
            <img
              src="/apple-touch-icon.png"
              alt="SAHARISH Monogram Crest"
              className="w-8 h-8 rounded-full border border-[#C49A6C]/60 p-0.5 object-cover group-hover:scale-105 transition-transform"
            />
            <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#42240D] tracking-wider uppercase">
              SAHARISH
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#7A582F] font-semibold -mt-0.5">
            Haute Couture &amp; Pret · ESTD 2023
          </span>
        </div>

        {/* Right: PWA Install, Wishlist, Account, Bag */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button (Official Component) */}
          <div className="hidden sm:block">
            <PWAInstallButton variant="header" />
          </div>

          {/* Wishlist */}
          <button
            onClick={() => onNavigate('auth')}
            className="relative p-2 text-[#42240D] hover:bg-[#F0EDE9] rounded-xl transition-colors"
            title="My Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#5C3A21] text-white text-[9px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* User Account Button */}
          <button
            onClick={() => onNavigate('auth')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-colors ${
              currentView === 'auth'
                ? 'bg-[#5C3A21] text-white border-[#5C3A21]'
                : 'bg-[#F6F3EE] hover:bg-[#EBE8E3] text-[#42240D] border-[#D4C3B9]'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="hidden md:inline">
              {customer ? customer.fullName.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Shopping Bag Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white shadow-md text-xs font-bold uppercase tracking-wider transition-all"
            aria-label="View Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Bag</span>
            <span className="w-5 h-5 rounded-full bg-[#C49A6C] text-[#2F1502] text-[10px] font-extrabold flex items-center justify-center">
              {totalCartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Category Pills Navigation (Desktop) */}
      <nav className="hidden lg:flex items-center justify-center gap-1 border-t border-[#D4C3B9]/30 py-2.5 px-4 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              onSelectCategory(cat.id);
              if (currentView !== 'store') onNavigate('store');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#5C3A21] text-white shadow-sm font-bold'
                : 'text-[#50443D] hover:text-[#42240D] hover:bg-[#F0EDE9]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D4C3B9] bg-[#FAF7F2] p-4 space-y-4 shadow-xl animate-in slide-in-from-top-3">
          {/* Mobile Search */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#82746C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search pret or fabric..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
            />
          </div>

          {/* PWA Mobile Button */}
          <PWAInstallButton variant="mobile" />

          {/* Categories */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A582F] block px-2">
              Collections &amp; Categories
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setMobileMenuOpen(false);
                    if (currentView !== 'store') onNavigate('store');
                  }}
                  className={`p-2 rounded-lg text-xs text-left font-medium uppercase tracking-wider ${
                    selectedCategory === cat.id
                      ? 'bg-[#5C3A21] text-white font-bold'
                      : 'bg-white text-[#50443D] border border-[#D4C3B9]/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Navigation Links */}
          <div className="pt-2 border-t border-[#D4C3B9]/40 flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate('auth');
                setMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl bg-white border border-[#D4C3B9] text-xs font-bold uppercase tracking-wider text-[#42240D] flex items-center justify-between"
            >
              <span>{customer ? `Signed in: ${customer.fullName}` : 'Sign In / Register'}</span>
              <User className="w-4 h-4 text-[#7A582F]" />
            </button>

            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl bg-[#42240D] text-[#FAF7F2] text-xs font-bold uppercase tracking-wider flex items-center justify-between"
            >
              <span>Admin Atelier Studio</span>
              <Shield className="w-4 h-4 text-[#C49A6C]" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

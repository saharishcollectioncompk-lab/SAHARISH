import React from 'react';
import {
  Diamond,
  AppWindow,
  PlusCircle,
  Boxes,
  Sparkles,
  Truck,
  Users,
  Settings,
  ShieldCheck,
  Store,
  Headset,
  KeyRound,
  Lock,
} from 'lucide-react';

export type AdminTab =
  | 'products'
  | 'add-product'
  | 'collections'
  | 'trash'
  | 'orders'
  | 'clients'
  | 'otp-logs'
  | 'security'
  | 'phone-settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onExitAdmin,
  onLogout,
}) => {
  return (
    <aside className="w-72 bg-[#F6F3EE] border-r border-[#D4C3B9]/50 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm z-20">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Atelier Logo Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[#E5E2DD] bg-[#F6F3EE]">
          <div className="w-10 h-10 rounded-xl bg-[#5C3A21] flex items-center justify-center text-[#FAF7F2] shadow-sm">
            <Diamond className="w-5 h-5 text-[#C49A6C]" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-wider text-[#42240D] uppercase">
              SAHARISH
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#7A582F] font-bold">
              Luxury Pret &amp; Couture
            </span>
          </div>
        </div>

        {/* Live Atelier Status Pill */}
        <div className="px-6 py-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EBE8E3] border border-[#D4C3B9]/40">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#50443D]">
              Couture Atelier Studio
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
          {/* Catalog & Atelier */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#82746C]">
              Catalog &amp; Atelier
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => onSelectTab('products')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs uppercase font-bold tracking-wider transition-all text-left ${
                  currentTab === 'products'
                    ? 'bg-[#5C3A21] text-white shadow-sm'
                    : 'text-[#50443D] hover:bg-[#EBE8E3] hover:text-[#42240D]'
                }`}
              >
                <AppWindow className="w-4 h-4" />
                <span>All Products</span>
              </button>

              <button
                onClick={() => onSelectTab('add-product')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs uppercase font-bold tracking-wider transition-all text-left ${
                  currentTab === 'add-product'
                    ? 'bg-[#5C3A21] text-white shadow-sm'
                    : 'text-[#50443D] hover:bg-[#EBE8E3] hover:text-[#42240D]'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Product</span>
              </button>

              <button
                onClick={() => onSelectTab('collections')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs uppercase font-bold tracking-wider transition-all text-left ${
                  currentTab === 'collections'
                    ? 'bg-[#5C3A21] text-white shadow-sm'
                    : 'text-[#50443D] hover:bg-[#EBE8E3] hover:text-[#42240D]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Collections &amp; Capsules</span>
              </button>

              <button
                onClick={() => onSelectTab('trash')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs uppercase font-bold tracking-wider transition-all text-left ${
                  currentTab === 'trash'
                    ? 'bg-[#5C3A21] text-white shadow-sm'
                    : 'text-[#82746C] hover:bg-[#EBE8E3] hover:text-[#BA1A1A]'
                }`}
              >
                <Boxes className="w-4 h-4 text-red-700" />
                <span>Trash &amp; Deleted Items</span>
              </button>
            </nav>
          </div>

          {/* Fulfillment & Clients */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#82746C]">
              Fulfillment &amp; Patrons
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => onSelectTab('orders')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs uppercase font-bold tracking-wider transition-all text-left ${
                  currentTab === 'orders'
                    ? 'bg-[#5C3A21] text-white shadow-sm'
                    : 'text-[#50443D] hover:bg-[#EBE8E3] hover:text-[#42240D]'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Orders &amp; Shipments</span>
              </button>

              <button
                onClick={() => onSelectTab('clients')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs uppercase font-bold tracking-wider transition-all text-left ${
                  currentTab === 'clients'
                    ? 'bg-[#5C3A21] text-white shadow-sm'
                    : 'text-[#50443D] hover:bg-[#EBE8E3] hover:text-[#42240D]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>VIP Clients</span>
              </button>
            </nav>
          </div>

          {/* Verification & System Administration */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#82746C]">
              Security &amp; Gateways
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => onSelectTab('security')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs uppercase font-bold tracking-wider transition-all text-left ${
                  currentTab === 'security'
                    ? 'bg-[#5C3A21] text-white shadow-sm'
                    : 'text-[#50443D] hover:bg-[#EBE8E3] hover:text-[#42240D]'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Security &amp; Gateways</span>
              </button>

              <button
                onClick={() => onSelectTab('otp-logs')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs uppercase font-bold tracking-wider transition-all text-left ${
                  currentTab === 'otp-logs'
                    ? 'bg-[#5C3A21] text-white shadow-sm'
                    : 'text-[#50443D] hover:bg-[#EBE8E3] hover:text-[#42240D]'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>OTP Verification Log</span>
              </button>

              <button
                onClick={() => onSelectTab('phone-settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs uppercase font-bold tracking-wider transition-all text-left ${
                  currentTab === 'phone-settings'
                    ? 'bg-[#5C3A21] text-white shadow-sm'
                    : 'text-[#50443D] hover:bg-[#EBE8E3] hover:text-[#42240D]'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Admin Phone Settings</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Bottom Concierge / Exit */}
        <div className="p-4 border-t border-[#E5E2DD] bg-[#EBE8E3]/60 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white shadow-sm border border-[#D4C3B9]/40">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-[#82746C]">Concierge Desk</span>
              <span className="text-xs font-bold text-[#42240D]">Online &amp; Active</span>
            </div>
            <Headset className="w-5 h-5 text-[#7A582F]" />
          </div>

          <button
            onClick={onExitAdmin}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#42240D] border border-[#D4C3B9] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Store className="w-4 h-4 text-[#5C3A21]" />
            <span>View Boutique Store</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-2 rounded-xl bg-[#FAF7F2] hover:bg-red-50 text-[#82746C] hover:text-[#BA1A1A] border border-[#D4C3B9]/60 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              title="Lock Session & Sign Out"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock / Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

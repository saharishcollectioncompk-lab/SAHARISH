import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Store,
  Diamond,
  LogOut,
  Lock,
  Unlock,
  ShieldCheck,
} from 'lucide-react';
import { Product } from '../../types';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { ProductsInventoryView } from './ProductsInventoryView';
import { AddEditProductStudio } from './AddEditProductStudio';
import { CollectionsMerchandisingView } from './CollectionsMerchandisingView';
import { OrdersManagementView } from './OrdersManagementView';
import { ClientsManagementView } from './ClientsManagementView';
import { OTPStatusView } from './OTPStatusView';
import { AdminPhoneSettingsView } from './AdminPhoneSettingsView';
import { TrashManagementView } from './TrashManagementView';
import { AdminSecurityDashboardView } from './AdminSecurityDashboardView';
import { AdminSettingsPasswordModal } from './AdminSettingsPasswordModal';
import { adminAuthService } from '../../services/adminAuthService';

interface AdminLayoutProps {
  onExitAdmin: () => void;
  onProductDeleted?: (id: string) => void;
  onLogout?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  onExitAdmin,
  onProductDeleted,
  onLogout,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Settings Password Protection
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState<boolean>(() =>
    adminAuthService.isAdminSettingsUnlocked()
  );
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<AdminTab | null>(null);

  // Check 15-min auto-lock periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const unlocked = adminAuthService.isAdminSettingsUnlocked();
      setIsSettingsUnlocked(unlocked);
      if (!unlocked && (currentTab === 'phone-settings' || currentTab === 'security')) {
        setCurrentTab('products');
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [currentTab]);

  const handleSelectTab = (tab: AdminTab) => {
    if (tab !== 'add-product') setEditingProduct(null);

    // If tab is settings or security, check password protection
    if (tab === 'phone-settings' || tab === 'security') {
      if (!adminAuthService.isAdminSettingsUnlocked()) {
        setPendingTab(tab);
        setShowPasswordModal(true);
        return;
      } else {
        adminAuthService.touchAdminSettingsActivity();
      }
    }

    setCurrentTab(tab);
  };

  const handlePasswordSuccess = () => {
    setIsSettingsUnlocked(true);
    setShowPasswordModal(false);
    if (pendingTab) {
      setCurrentTab(pendingTab);
      setPendingTab(null);
    }
  };

  const handleLockSettings = () => {
    adminAuthService.lockAdminSettings();
    setIsSettingsUnlocked(false);
    if (currentTab === 'phone-settings' || currentTab === 'security') {
      setCurrentTab('products');
    }
  };

  const handleStartAddProduct = () => {
    setEditingProduct(null);
    setCurrentTab('add-product');
  };

  const handleStartEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setCurrentTab('add-product');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex">
      {/* Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onExitAdmin={onExitAdmin}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar matching code_2b239883.html */}
        <header className="h-20 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#D4C3B9]/50 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          {/* Search */}
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#82746C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pret articles, orders, or haute couture serials..."
                className="w-full bg-[#F6F3EE] text-[#1C1C19] placeholder:text-[#82746C]/70 pl-9 pr-4 py-2 rounded-xl text-xs border border-[#D4C3B9] focus:outline-none focus:border-[#5C3A21] focus:bg-white transition-all"
              />
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FECF9D]/40 text-[#79562E] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Store</span>
            </div>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Settings Lock/Unlock Status */}
            {isSettingsUnlocked ? (
              <button
                type="button"
                onClick={handleLockSettings}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold uppercase tracking-wider transition-colors"
                title="Admin Settings are currently unlocked. Click to lock."
              >
                <Unlock className="w-3.5 h-3.5 text-amber-600" />
                <span>Settings Unlocked</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPendingTab('security');
                  setShowPasswordModal(true);
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#D4C3B9] text-[#7A582F] text-[11px] font-bold uppercase tracking-wider transition-colors"
                title="Admin Settings are password-protected"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Settings Locked</span>
              </button>
            )}

            <button
              onClick={onExitAdmin}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F6F3EE] border border-[#D4C3B9] text-[#42240D] text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-[#5C3A21]" />
              <span>View Boutique</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => handleSelectTab('phone-settings')}
              className="relative p-2 rounded-full text-[#82746C] hover:text-[#42240D] hover:bg-white transition-colors"
              title="Admin Alerts & Phone Settings"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#BA1A1A]"></span>
            </button>

            {/* Head Curator Profile */}
            <div className="flex items-center gap-3 pl-2 border-l border-[#D4C3B9]/60">
              <div className="text-right hidden sm:flex flex-col">
                <span className="text-xs uppercase font-bold tracking-wider text-[#42240D]">
                  Maha Al-Saharish
                </span>
                <span className="text-[10px] uppercase font-bold text-[#82746C]">
                  Head Curator
                </span>
              </div>
              <img
                src="/apple-touch-icon.png"
                alt="Head Curator"
                className="w-9 h-9 rounded-full object-cover border border-[#C49A6C]"
              />

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-[#82746C] hover:text-[#BA1A1A] hover:bg-red-50 transition-colors ml-1"
                  title="Sign Out / Lock Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Tab View Content */}
        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto">
          {currentTab === 'products' && (
            <ProductsInventoryView
              onAddProductClick={handleStartAddProduct}
              onEditProductClick={handleStartEditProduct}
              onProductDeleted={onProductDeleted}
              onGoToTrash={() => setCurrentTab('trash')}
            />
          )}

          {currentTab === 'add-product' && (
            <AddEditProductStudio
              initialProduct={editingProduct}
              onSaved={() => setCurrentTab('products')}
              onCancel={() => setCurrentTab('products')}
            />
          )}

          {currentTab === 'collections' && (
            <CollectionsMerchandisingView onGoToTrash={() => setCurrentTab('trash')} />
          )}

          {currentTab === 'trash' && <TrashManagementView />}

          {currentTab === 'orders' && <OrdersManagementView />}

          {currentTab === 'clients' && <ClientsManagementView />}

          {currentTab === 'otp-logs' && <OTPStatusView />}

          {currentTab === 'security' && (
            <AdminSecurityDashboardView onLockSettings={handleLockSettings} />
          )}

          {currentTab === 'phone-settings' && <AdminPhoneSettingsView />}
        </main>
      </div>

      {/* Password Protection Modal for Admin Settings & Security */}
      <AdminSettingsPasswordModal
        isOpen={showPasswordModal}
        targetSectionName={
          pendingTab === 'phone-settings' ? 'Admin Phone Settings' : 'Security & Gateways Dashboard'
        }
        onSuccess={handlePasswordSuccess}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingTab(null);
        }}
      />
    </div>
  );
};

import React, { useState } from 'react';
import {
  ShoppingBag,
  MapPin,
  Heart,
  UserCheck,
  Truck,
  FileText,
  Plus,
  Trash2,
  LogOut,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { CustomerUser, Order, Product } from '../../types';
import { storageService } from '../../services/storageService';

interface CustomerProfileProps {
  customer: CustomerUser;
  onLogout: () => void;
  onUpdateCustomer: (updated: CustomerUser) => void;
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  customer,
  onLogout,
  onUpdateCustomer,
  onSelectProduct,
  onAddToCart,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'profile'>('orders');
  const [orders] = useState<Order[]>(() => storageService.getOrders());
  const [products] = useState<Product[]>(() => storageService.getProducts());

  // Edit Profile form state
  const [name, setName] = useState(customer.fullName);
  const [phone, setPhone] = useState(customer.phone);
  const [bust, setBust] = useState(customer.measurements?.bust || '36 in');
  const [waist, setWaist] = useState(customer.measurements?.waist || '28 in');
  const [hips, setHips] = useState(customer.measurements?.hips || '39 in');
  const [shirtLength, setShirtLength] = useState(customer.measurements?.shirtLength || '45 in');
  const [notes, setNotes] = useState(customer.measurements?.notes || '');
  const [saveToast, setSaveToast] = useState(false);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newLabel, setNewLabel] = useState('Second Home');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Lahore');
  const [newPhone, setNewPhone] = useState(customer.phone);

  // Tracking modal state
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const wishlistProducts = products.filter((p) => customer.wishlistIds.includes(p.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CustomerUser = {
      ...customer,
      fullName: name,
      phone,
      measurements: {
        bust,
        waist,
        hips,
        shirtLength,
        sleeves: '22 in',
        notes,
      },
    };
    storageService.saveCustomer(updated);
    storageService.saveCurrentCustomer(updated);
    onUpdateCustomer(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet) return;

    const newAddr = {
      id: `addr-${Date.now()}`,
      label: newLabel,
      fullName: customer.fullName,
      phone: newPhone,
      addressLine: newStreet,
      city: newCity,
      postalCode: '54000',
      country: 'Pakistan',
      isDefault: false,
    };

    const updated = {
      ...customer,
      addresses: [...customer.addresses, newAddr],
    };
    storageService.saveCustomer(updated);
    storageService.saveCurrentCustomer(updated);
    onUpdateCustomer(updated);
    setShowAddressModal(false);
    setNewStreet('');
  };

  const handleRemoveAddress = (addrId: string) => {
    const updated = {
      ...customer,
      addresses: customer.addresses.filter((a) => a.id !== addrId),
    };
    storageService.saveCustomer(updated);
    storageService.saveCurrentCustomer(updated);
    onUpdateCustomer(updated);
  };

  const handleRemoveWishlist = (productId: string) => {
    const updated = {
      ...customer,
      wishlistIds: customer.wishlistIds.filter((id) => id !== productId),
    };
    storageService.saveCustomer(updated);
    storageService.saveCurrentCustomer(updated);
    onUpdateCustomer(updated);
  };

  return (
    <section className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 sm:p-10 space-y-8 border border-[#D4C3B9]/40">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E5E2DD] gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#7A582F] font-bold block mb-1">
            Authenticated Sanctuary · ESTD 2023
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#42240D]">
            Welcome, {customer.fullName}
          </h2>
          <p className="text-xs text-[#50443D] mt-0.5">
            Manage your bespoke pret commissions, tracking updates, and master tailor profiles.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#D4C3B9]/60">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-[#50443D]">
              Verified via <strong className="uppercase text-[#42240D]">{customer.verifiedVia || 'WhatsApp'}</strong>
            </span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-[#BA1A1A] hover:bg-[#FFDAD6]/30 border border-[#BA1A1A]/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 border-b border-[#E5E2DD]">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-lg text-xs uppercase font-bold tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-[#5C3A21] text-white shadow-sm'
              : 'bg-[#F6F3EE] text-[#50443D] hover:bg-[#EBE8E3]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-5 py-2.5 rounded-lg text-xs uppercase font-bold tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'addresses'
              ? 'bg-[#5C3A21] text-white shadow-sm'
              : 'bg-[#F6F3EE] text-[#50443D] hover:bg-[#EBE8E3]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Delivery Addresses ({customer.addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-5 py-2.5 rounded-lg text-xs uppercase font-bold tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'wishlist'
              ? 'bg-[#5C3A21] text-white shadow-sm'
              : 'bg-[#F6F3EE] text-[#50443D] hover:bg-[#EBE8E3]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>My Wishlist ({wishlistProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 rounded-lg text-xs uppercase font-bold tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-[#5C3A21] text-white shadow-sm'
              : 'bg-[#F6F3EE] text-[#50443D] hover:bg-[#EBE8E3]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Bespoke Measurements &amp; Settings</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#42240D]">Recent Orders</h3>
            <span className="text-xs text-[#82746C]">Total Commissions: {orders.length}</span>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#F6F3EE] rounded-2xl p-5 sm:p-6 border border-[#D4C3B9]/40 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5E2DD]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#82746C] block">
                      Order Identifier
                    </span>
                    <span className="font-serif text-lg font-extrabold text-[#42240D]">
                      {order.orderNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#50443D]">{order.date}</span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FECF9D] text-[#79562E]">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-[#D4C3B9]/30">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-20 object-cover rounded-lg shadow-sm"
                      />
                      <div className="flex-1">
                        <h4 className="font-serif font-bold text-sm text-[#42240D]">
                          {item.title}
                        </h4>
                        <div className="text-xs text-[#82746C] flex items-center gap-2 mt-0.5">
                          <span>SKU: {item.sku}</span>
                          <span>·</span>
                          <span className="uppercase font-semibold text-[#5C3A21]">Size: {item.size}</span>
                          <span>·</span>
                          <span className="capitalize">{item.deliverable}</span>
                        </div>
                        <div className="text-xs font-bold text-[#7A582F] mt-1">
                          PKR {item.price.toLocaleString()} × {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-between items-center gap-4 pt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#82746C] block">
                      Total Valuation
                    </span>
                    <span className="font-serif text-lg font-bold text-[#7A582F]">
                      PKR {order.total.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#50443D] block">
                      Estimated Delivery via {order.courier}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTrackingOrder(order)}
                      className="px-4 py-2 rounded-lg bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Order</span>
                    </button>
                    <button
                      onClick={() => setInvoiceOrder(order)}
                      className="px-4 py-2 rounded-lg bg-white hover:bg-[#EBE8E3] text-[#42240D] border border-[#D4C3B9] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#42240D]">Saved Delivery Addresses</h3>
              <p className="text-xs text-[#50443D]">Addresses used for expedited courier checkout.</p>
            </div>
            <button
              onClick={() => setShowAddressModal(true)}
              className="px-4 py-2 rounded-lg bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-[#F6F3EE] rounded-2xl p-5 border border-[#D4C3B9]/40 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FFDCC6] text-[#2F1502]">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  {customer.addresses.length > 1 && (
                    <button
                      onClick={() => handleRemoveAddress(addr.id)}
                      className="text-[#82746C] hover:text-[#BA1A1A] p-1"
                      title="Remove Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-1 text-xs text-[#50443D]">
                  <p className="font-bold text-sm text-[#42240D]">{addr.fullName}</p>
                  <p>{addr.addressLine}</p>
                  <p>{addr.city}, {addr.country} {addr.postalCode}</p>
                  <p className="text-[#7A582F] font-medium">Contact: {addr.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#42240D]">Curated Wishlist</h3>
            <span className="text-xs text-[#82746C]">{wishlistProducts.length} items</span>
          </div>

          {wishlistProducts.length === 0 ? (
            <div className="text-center py-12 bg-[#F6F3EE] rounded-2xl border border-dashed border-[#D4C3B9]">
              <Heart className="w-10 h-10 text-[#C49A6C] mx-auto mb-2" />
              <p className="font-serif text-base text-[#42240D]">Your wishlist is currently empty.</p>
              <p className="text-xs text-[#82746C] mt-1">Explore our Festive Pret &amp; Chikankari collections to curate pieces.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {wishlistProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#F6F3EE] rounded-2xl overflow-hidden border border-[#D4C3B9]/40 flex flex-col justify-between group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-white">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() => handleRemoveWishlist(p.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 text-[#BA1A1A] flex items-center justify-center shadow-md hover:bg-white"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
                      {p.category}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#42240D] line-clamp-1">
                      {p.title}
                    </h4>
                    <div className="font-serif font-bold text-base text-[#7A582F]">
                      PKR {p.price.toLocaleString()}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => onSelectProduct && onSelectProduct(p)}
                        className="w-full py-2 rounded-lg bg-white hover:bg-[#EBE8E3] text-[#42240D] border border-[#D4C3B9] text-xs font-semibold uppercase tracking-wider"
                      >
                        Quick View
                      </button>
                      <button
                        onClick={() => onAddToCart && onAddToCart(p)}
                        className="w-full py-2 rounded-lg bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Bespoke Measurements & Settings */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Details */}
            <div className="bg-[#F6F3EE] rounded-2xl p-6 border border-[#D4C3B9]/40 space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#42240D]">Personal Identity</h3>

              <div>
                <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] focus:outline-none focus:border-[#5C3A21]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customer.email}
                  disabled
                  className="w-full p-2.5 bg-[#E5E2DD] border border-[#D4C3B9] rounded-xl text-xs text-[#50443D] cursor-not-allowed"
                />
                <span className="text-[10px] text-[#82746C] mt-1 block">
                  Email verified with SAHARISH Atelier.
                </span>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] focus:outline-none focus:border-[#5C3A21]"
                  required
                />
              </div>
            </div>

            {/* Bespoke Tailoring Measurements */}
            <div className="bg-[#F6F3EE] rounded-2xl p-6 border border-[#D4C3B9]/40 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-[#42240D]">
                  Bespoke Pret Measurements
                </h3>
                <span className="text-[10px] uppercase font-bold text-[#7A582F] bg-[#FFDCC6] px-2.5 py-0.5 rounded-full">
                  Master Tailor Spec
                </span>
              </div>
              <p className="text-xs text-[#50443D]">
                Saved measurements are referenced automatically by our master cutters for pret custom stitch adjustments.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                    Bust
                  </label>
                  <input
                    type="text"
                    value={bust}
                    onChange={(e) => setBust(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] focus:outline-none focus:border-[#5C3A21]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                    Waist
                  </label>
                  <input
                    type="text"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] focus:outline-none focus:border-[#5C3A21]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                    Hips
                  </label>
                  <input
                    type="text"
                    value={hips}
                    onChange={(e) => setHips(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] focus:outline-none focus:border-[#5C3A21]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                    Shirt Length
                  </label>
                  <input
                    type="text"
                    value={shirtLength}
                    onChange={(e) => setShirtLength(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] focus:outline-none focus:border-[#5C3A21]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                  Tailoring Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] focus:outline-none focus:border-[#5C3A21] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveToast && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Profile &amp; Measurements updated successfully.
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-6 py-3 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-[#C49A6C]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DD]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#5C3A21]" />
                <h3 className="font-serif text-lg font-bold text-[#42240D]">
                  Live Courier Tracking
                </h3>
              </div>
              <button
                onClick={() => setTrackingOrder(null)}
                className="text-[#82746C] hover:text-[#42240D]"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#D4C3B9] space-y-1 text-xs">
              <div className="flex justify-between font-bold text-[#42240D]">
                <span>Order: {trackingOrder.orderNumber}</span>
                <span className="text-[#5C3A21]">{trackingOrder.courier}</span>
              </div>
              <div className="text-[#50443D]">Waybill: <strong className="font-mono">{trackingOrder.trackingNumber}</strong></div>
              <div className="text-[#82746C]">Destination: {trackingOrder.shippingAddress.city}, Pakistan</div>
            </div>

            {/* Tracking Steps */}
            <div className="space-y-4 pl-2 border-l-2 border-[#C49A6C] ml-4 text-xs">
              <div className="relative pl-4">
                <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-emerald-600"></div>
                <div className="font-bold text-[#42240D]">Handed to Leopards Express Courier</div>
                <div className="text-[11px] text-[#82746C]">Lahore Hub · Today 08:30 AM</div>
              </div>
              <div className="relative pl-4">
                <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-[#5C3A21]"></div>
                <div className="font-bold text-[#42240D]">Atelier Quality &amp; Custom Sizing Pass</div>
                <div className="text-[11px] text-[#82746C]">SAHARISH Lahore Master Studio · Jan 25</div>
              </div>
              <div className="relative pl-4">
                <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-[#82746C]"></div>
                <div className="font-bold text-[#42240D]">Bespoke Commission Confirmed</div>
                <div className="text-[11px] text-[#82746C]">Verified via WhatsApp · Jan 24</div>
              </div>
            </div>

            <button
              onClick={() => setTrackingOrder(null)}
              className="w-full py-2.5 rounded-xl bg-[#5C3A21] text-white text-xs font-bold uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-[#C49A6C]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DD]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#5C3A21]" />
                <h3 className="font-serif text-lg font-bold text-[#42240D]">Official Invoice Receipt</h3>
              </div>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="text-[#82746C] hover:text-[#42240D]"
              >
                ✕
              </button>
            </div>

            <div className="text-center pb-2">
              <span className="font-serif text-xl font-bold tracking-wider text-[#42240D]">SAHARISH</span>
              <p className="text-[10px] uppercase tracking-widest text-[#7A582F]">Haute Couture &amp; Pret · ESTD 2023</p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-xl text-xs space-y-2 border border-[#D4C3B9]">
              <div className="flex justify-between">
                <span className="text-[#82746C]">Invoice #:</span>
                <span className="font-bold text-[#42240D]">{invoiceOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#82746C]">Date:</span>
                <span>{invoiceOrder.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#82746C]">Customer:</span>
                <span>{invoiceOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#82746C]">Payment Method:</span>
                <span>{invoiceOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {invoiceOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between pb-2 border-b border-[#F0EDE9]">
                  <div>
                    <div className="font-bold text-[#42240D]">{it.title}</div>
                    <div className="text-[11px] text-[#82746C]">Size: {it.size} ({it.deliverable})</div>
                  </div>
                  <div className="font-bold text-[#7A582F]">PKR {(it.price * it.quantity).toLocaleString()}</div>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm text-[#42240D] pt-2">
                <span>Grand Total:</span>
                <span>PKR {invoiceOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Invoice downloaded as PDF (simulated).');
                setInvoiceOrder(null);
              }}
              className="w-full py-2.5 rounded-xl bg-[#5C3A21] text-white text-xs font-bold uppercase tracking-wider"
            >
              Print / Download PDF
            </button>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddAddress}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#C49A6C]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E2DD]">
              <h3 className="font-serif text-lg font-bold text-[#42240D]">Add Delivery Address</h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="text-[#82746C] hover:text-[#42240D]"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">Address Label</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Islamabad Residence, Office"
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">Street Address</label>
              <textarea
                value={newStreet}
                onChange={(e) => setNewStreet(e.target.value)}
                placeholder="House / Apartment #, Street, Sector / Area"
                rows={2}
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">City</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">Mobile Contact</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="w-1/2 py-2.5 rounded-xl bg-[#EBE8E3] text-[#42240D] text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-[#5C3A21] text-white text-xs font-bold uppercase tracking-wider"
              >
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Truck,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { CartItem, CustomerUser, Order } from '../../types';
import { storageService } from '../../services/storageService';
import { adminNotificationService } from '../../services/adminNotificationService';

interface CheckoutModalProps {
  items: CartItem[];
  customer: CustomerUser | null;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  items,
  customer,
  onClose,
  onOrderSuccess,
}) => {
  const [name, setName] = useState(customer?.fullName || 'Ayesha Noor');
  const [email, setEmail] = useState(customer?.email || 'ayesha.noor@couture.pk');
  const [phone, setPhone] = useState(customer?.phone || '+92 309 7309810');
  const [address, setAddress] = useState(
    customer?.addresses?.[0]?.addressLine || 'Villa 42-B, Street 14, Phase 6, DHA'
  );
  const [city, setCity] = useState(customer?.addresses?.[0]?.city || 'Lahore');
  const [paymentMethod, setPaymentMethod] = useState<
    'Cash on Delivery (COD)' | 'Direct Bank Transfer' | 'Credit / Debit Card'
  >('Cash on Delivery (COD)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const shippingFee = subtotal > 15000 ? 0 : 450;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `#SAH-${randomSuffix}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: {
        id: `addr-${Date.now()}`,
        label: 'Delivery Residence',
        fullName: name,
        phone,
        addressLine: address,
        city,
        postalCode: '54000',
        country: 'Pakistan',
        isDefault: true,
      },
      items: items.map((it) => ({
        productId: it.product.id,
        title: it.product.title,
        sku: it.product.sku,
        image: it.product.images[0],
        size: it.size,
        deliverable: it.deliverable,
        price: it.product.price,
        quantity: it.quantity,
      })),
      subtotal,
      shippingFee,
      discount: 0,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery (COD)' ? 'Pending' : 'Paid',
      orderStatus: 'Processing / Tailoring',
      courier: 'Leopards Express Courier',
      trackingNumber: `LEO-${Math.floor(1000000 + Math.random() * 9000000)}PK`,
      notes,
    };

    // Save order
    storageService.saveOrder(newOrder);

    // Trigger Admin 1 and Admin 2 notification alerts!
    adminNotificationService.notifyAdmins({
      event: 'New Boutique Order',
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      orderNumber,
      orderTotal: total,
      details: `${items.length} outfit(s) via ${paymentMethod} to ${city}.`,
    });

    setIsSubmitting(false);
    setConfirmedOrder(newOrder);
    onOrderSuccess(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#C49A6C]/40 overflow-hidden my-auto p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#82746C] hover:text-[#42240D] p-1.5 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedOrder ? (
          /* Success Screen */
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F] block">
              Bespoke Commission Placed
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#42240D]">
              Thank You, {confirmedOrder.customerName}!
            </h2>

            <p className="text-xs text-[#50443D] max-w-md mx-auto">
              Your order <strong className="text-[#42240D]">{confirmedOrder.orderNumber}</strong> has been forwarded to our Master Tailor and Lahore fulfillment studio.
            </p>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#D4C3B9] text-xs text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-[#82746C]">Total Amount:</span>
                <span className="font-bold text-[#42240D]">PKR {confirmedOrder.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#82746C]">Payment Method:</span>
                <span className="font-medium text-[#42240D]">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#82746C]">Assigned Courier:</span>
                <span className="font-medium text-[#42240D]">{confirmedOrder.courier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#82746C]">Tracking Waybill:</span>
                <span className="font-mono font-bold text-[#5C3A21]">{confirmedOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E5E2DD] text-[11px] text-[#7A582F]">
                <span>Admin Alerts:</span>
                <span className="font-semibold">Dispatched to Admin 1 &amp; Admin 2</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
              >
                Return to Lookbook
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C49A6C]" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
                  Secure Atelier Checkout
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#42240D]">
                Confirm Boutique Commission
              </h2>
            </div>

            {/* Delivery Details */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-bold tracking-wider text-[#42240D] block">
                1. Delivery &amp; Contact Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#7A582F] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#7A582F] mb-1">
                    WhatsApp / Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-[#7A582F] mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Flat #, Street, Phase / Block"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#7A582F] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#7A582F] mb-1">
                    Email (for invoice)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-bold tracking-wider text-[#42240D] block">
                2. Select Payment Method
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash on Delivery (COD)')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'Cash on Delivery (COD)'
                      ? 'bg-[#FAF7F2] border-[#5C3A21] shadow-sm ring-1 ring-[#5C3A21]'
                      : 'bg-white border-[#D4C3B9] text-[#50443D]'
                  }`}
                >
                  <Truck className="w-4 h-4 text-[#5C3A21] mb-1" />
                  <div className="font-bold text-xs text-[#42240D]">Cash on Delivery</div>
                  <div className="text-[10px] text-[#82746C]">Pay upon courier arrival</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Direct Bank Transfer')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'Direct Bank Transfer'
                      ? 'bg-[#FAF7F2] border-[#5C3A21] shadow-sm ring-1 ring-[#5C3A21]'
                      : 'bg-white border-[#D4C3B9] text-[#50443D]'
                  }`}
                >
                  <Building className="w-4 h-4 text-[#5C3A21] mb-1" />
                  <div className="font-bold text-xs text-[#42240D]">Bank Transfer</div>
                  <div className="text-[10px] text-[#82746C]">Meezan / SCB Pakistan</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Credit / Debit Card')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'Credit / Debit Card'
                      ? 'bg-[#FAF7F2] border-[#5C3A21] shadow-sm ring-1 ring-[#5C3A21]'
                      : 'bg-white border-[#D4C3B9] text-[#50443D]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#5C3A21] mb-1" />
                  <div className="font-bold text-xs text-[#42240D]">Credit / Debit Card</div>
                  <div className="text-[10px] text-[#82746C]">Visa &amp; Mastercard</div>
                </button>
              </div>

              {paymentMethod === 'Direct Bank Transfer' && (
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D4C3B9] text-[11px] text-[#50443D] space-y-1">
                  <p className="font-bold text-[#42240D]">Official SAHARISH Atelier Bank Account:</p>
                  <p>Bank: Meezan Bank Limited · DHA Phase 5 Branch</p>
                  <p>Title: SAHARISH LUXURY PRET &amp; COUTURE</p>
                  <p className="font-mono font-bold text-[#5C3A21]">IBAN: PK68MEZN00010293847561</p>
                  <p className="text-[10px] text-[#82746C]">Share payment screenshot via WhatsApp after submitting order.</p>
                </div>
              )}
            </div>

            {/* Valuation Summary */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#D4C3B9]/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#82746C]">Subtotal ({items.length} items):</span>
                <span className="font-medium text-[#42240D]">PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#82746C]">Insured Courier Shipping:</span>
                <span className="font-medium text-emerald-700">
                  {shippingFee === 0 ? 'Complimentary' : `PKR ${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#42240D] pt-2 border-t border-[#E5E2DD]">
                <span>Total Amount:</span>
                <span className="text-[#5C3A21]">PKR {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Confirming with Studio...' : 'Confirm Order &amp; Dispatch'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

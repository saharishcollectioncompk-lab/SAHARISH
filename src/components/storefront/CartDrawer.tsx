import React from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Sparkles } from 'lucide-react';
import { CartItem, ProductSize, DeliverableType } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, size: ProductSize, deliverable: DeliverableType, delta: number) => void;
  onRemoveItem: (productId: string, size: ProductSize, deliverable: DeliverableType) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const freeShippingThreshold = 15000;
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col justify-between border-l border-[#C49A6C]/40 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 bg-white border-b border-[#D4C3B9]/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#5C3A21]" />
              <h3 className="font-serif text-lg font-bold text-[#42240D]">
                Your Shopping Bag ({items.reduce((a, b) => a + b.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#82746C] hover:text-[#42240D] hover:bg-[#F0EDE9]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-5 py-3 bg-[#FAF7F2] border-b border-[#D4C3B9]/30 text-xs">
            {remainingForFree > 0 ? (
              <p className="text-[#50443D]">
                Add <strong className="text-[#5C3A21]">PKR {remainingForFree.toLocaleString()}</strong> more to unlock <strong className="text-[#42240D]">Free Insured Express Delivery</strong>!
              </p>
            ) : (
              <p className="text-emerald-800 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>You unlocked Complimentary Insured Express Delivery!</span>
              </p>
            )}
            <div className="w-full bg-[#E5E2DD] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#5C3A21] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <ShoppingBag className="w-12 h-12 text-[#C49A6C] mx-auto opacity-50" />
                <h4 className="font-serif text-base font-bold text-[#42240D]">
                  Your bag is empty
                </h4>
                <p className="text-xs text-[#82746C] max-w-xs mx-auto">
                  Explore our luxury pret, festive formals, and hand-cut lawn ensembles.
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 px-5 py-2.5 rounded-xl bg-[#5C3A21] text-white text-xs font-bold uppercase tracking-wider"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((it, idx) => (
                <div
                  key={`${it.product.id}-${it.size}-${it.deliverable}-${idx}`}
                  className="flex gap-3 bg-white p-3.5 rounded-2xl border border-[#D4C3B9]/50 shadow-sm"
                >
                  <img
                    src={it.product.images[0]}
                    alt={it.product.title}
                    className="w-20 h-24 object-cover rounded-xl shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif text-xs font-bold text-[#42240D] line-clamp-1">
                          {it.product.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(it.product.id, it.size, it.deliverable)}
                          className="text-[#82746C] hover:text-red-700 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#82746C] mt-0.5 flex flex-wrap gap-1.5">
                        <span className="font-semibold text-[#5C3A21]">Size: {it.size}</span>
                        <span>·</span>
                        <span className="capitalize">{it.deliverable}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="font-serif font-bold text-xs text-[#42240D]">
                        PKR {(it.product.price * it.quantity).toLocaleString()}
                      </div>

                      <div className="flex items-center border border-[#D4C3B9] rounded-lg overflow-hidden bg-[#FAF7F2]">
                        <button
                          onClick={() => onUpdateQuantity(it.product.id, it.size, it.deliverable, -1)}
                          className="p-1 hover:bg-[#E5E2DD] text-[#42240D]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold">{it.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(it.product.id, it.size, it.deliverable, 1)}
                          className="p-1 hover:bg-[#E5E2DD] text-[#42240D]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t border-[#D4C3B9]/50 space-y-3">
              <div className="space-y-1.5 text-xs text-[#50443D]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-[#42240D]">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Courier Shipping:</span>
                  <span className="font-semibold text-emerald-800">
                    {subtotal >= freeShippingThreshold ? 'FREE' : 'PKR 450'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#42240D] pt-2 border-t border-[#E5E2DD]">
                  <span>Total Amount:</span>
                  <span className="text-[#5C3A21]">
                    PKR {(subtotal + (subtotal >= freeShippingThreshold ? 0 : 450)).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

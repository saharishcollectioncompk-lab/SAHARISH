import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  Truck,
  Sparkles,
  Heart,
  Check,
  Scissors,
} from 'lucide-react';
import { Product, ProductSize, DeliverableType } from '../../types';
import { storageService } from '../../services/storageService';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: ProductSize, deliverable: DeliverableType) => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize>('M');
  const [selectedDeliverable, setSelectedDeliverable] = useState<DeliverableType>('stitched');
  const [addedToast, setAddedToast] = useState(false);

  const settings = storageService.getAdminSettings();
  const officialPhoneDigits = settings.officialWhatsAppNumber.replace(/\D/g, '') || '3097309810';

  const currentStock = product.sizeStocks[selectedSize]?.stock ?? 0;

  const handleInstantWhatsAppOrder = () => {
    const text = encodeURIComponent(
      `Salam SAHARISH Atelier! I would like to place an order for the *${product.title}* (SKU: ${product.sku}).\nSize: ${selectedSize}\nDeliverable: ${
        selectedDeliverable === 'stitched' ? 'Ready-to-Wear (Stitched Silhouette)' : 'Unstitched Fabric Pack'
      }\nPrice: PKR ${product.price.toLocaleString()}\nPlease guide me on dispatch to my address.`
    );
    window.open(`https://wa.me/${officialPhoneDigits}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleBagAdd = () => {
    onAddToCart(product, selectedSize, selectedDeliverable);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const sizes: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#C49A6C]/40 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 text-[#42240D] hover:bg-white flex items-center justify-center shadow-lg transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#D4C3B9]/50">
            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF7F2] shadow-sm mb-4">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-full bg-white/95 text-[#42240D] font-bold text-[10px] uppercase tracking-wider shadow-sm border border-[#C49A6C]/30">
                  {product.status}
                </span>
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[#5C3A21] ring-2 ring-[#C49A6C]/40 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Narrative, Matrix & Actions (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
                    {product.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#82746C] bg-white px-2.5 py-0.5 rounded-full border border-[#D4C3B9]/60">
                    SKU: {product.sku}
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#42240D]">
                  {product.title}
                </h2>
                <p className="text-xs text-[#50443D] font-medium">
                  Fabric: {product.fabric}
                </p>
              </div>

              {/* Price & Off-Price */}
              <div className="flex items-baseline gap-3 p-3.5 rounded-2xl bg-white border border-[#D4C3B9]/50 shadow-sm">
                <span className="font-serif text-2xl font-extrabold text-[#42240D]">
                  PKR {product.price.toLocaleString()}
                </span>
                {product.compareAtPrice > product.price && (
                  <span className="text-xs text-[#82746C] line-through font-medium">
                    PKR {product.compareAtPrice.toLocaleString()}
                  </span>
                )}
                <span className="ml-auto text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Complimentary Luxury Packaging
                </span>
              </div>

              {/* Deliverable Selector: Stitched vs Unstitched */}
              <div className="space-y-2">
                <label className="block text-xs uppercase font-bold tracking-wider text-[#42240D]">
                  Deliverable Execution
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedDeliverable('stitched')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedDeliverable === 'stitched'
                        ? 'bg-white border-[#5C3A21] shadow-md ring-1 ring-[#5C3A21]'
                        : 'bg-[#F6F3EE] border-[#D4C3B9] hover:bg-white text-[#50443D]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#42240D]">Ready-to-Wear (Stitched)</span>
                      {selectedDeliverable === 'stitched' && <Check className="w-3.5 h-3.5 text-[#5C3A21]" />}
                    </div>
                    <p className="text-[11px] text-[#82746C] leading-snug">
                      Precision cut, tailored inner linings, and hand-finished lace trimmings.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDeliverable('unstitched')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedDeliverable === 'unstitched'
                        ? 'bg-white border-[#5C3A21] shadow-md ring-1 ring-[#5C3A21]'
                        : 'bg-[#F6F3EE] border-[#D4C3B9] hover:bg-white text-[#50443D]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#42240D]">Unstitched Fabric Pack</span>
                      {selectedDeliverable === 'unstitched' && <Check className="w-3.5 h-3.5 text-[#5C3A21]" />}
                    </div>
                    <p className="text-[11px] text-[#82746C] leading-snug">
                      Raw silk shirt panels (3.25m), organza dupatta (2.75m), &amp; unstitched raw silk trouser.
                    </p>
                  </button>
                </div>
              </div>

              {/* Sizing Matrix & Stock Indicators */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase font-bold tracking-wider text-[#42240D]">
                    Select Haute Pret Size
                  </label>
                  <span className="text-[11px] text-[#7A582F] font-semibold">
                    Stock Available: {currentStock} Units
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {sizes.map((sz) => {
                    const stockItem = product.sizeStocks[sz];
                    const count = stockItem?.stock ?? 0;
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`py-3 px-2 rounded-xl text-center border transition-all ${
                          isSelected
                            ? 'bg-[#5C3A21] text-white border-[#5C3A21] shadow-md'
                            : count > 0
                            ? 'bg-white text-[#42240D] border-[#D4C3B9] hover:border-[#5C3A21]'
                            : 'bg-[#F0EDE9] text-[#82746C] border-[#D4C3B9]/40 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="font-bold text-xs">{stockItem.label}</div>
                        <div
                          className={`text-[9px] uppercase font-semibold mt-0.5 ${
                            isSelected ? 'text-[#F7E7E0]' : count <= 2 ? 'text-[#BA1A1A]' : 'text-[#82746C]'
                          }`}
                        >
                          {count <= 2 ? `${count} Left` : `${count} In Stock`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fabric Narrative Breakdown */}
              <div className="bg-white p-4 rounded-2xl border border-[#D4C3B9]/50 space-y-2 text-xs text-[#50443D]">
                <div>
                  <strong className="text-[#42240D] font-bold">Shirt Details:</strong>{' '}
                  {product.description.shirt}
                </div>
                <div>
                  <strong className="text-[#42240D] font-bold">Dupatta Draped Fall:</strong>{' '}
                  {product.description.dupatta}
                </div>
                <div>
                  <strong className="text-[#42240D] font-bold">Trouser &amp; Finishing:</strong>{' '}
                  {product.description.trouser}
                </div>
                <div className="text-[11px] text-[#82746C] pt-1">
                  <em>{product.description.care}</em>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-4 border-t border-[#D4C3B9]/50">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <button
                  onClick={handleBagAdd}
                  className="sm:col-span-6 py-3.5 px-4 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C49A6C]" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={handleInstantWhatsAppOrder}
                  className="sm:col-span-5 py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                  <span>Instant WhatsApp Order</span>
                </button>

                <button
                  onClick={onToggleWishlist}
                  className={`sm:col-span-1 py-3.5 rounded-xl border flex items-center justify-center transition-colors ${
                    isWishlisted
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-white border-[#D4C3B9] text-[#42240D] hover:bg-[#F6F3EE]'
                  }`}
                  title="Toggle Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-600' : ''}`} />
                </button>
              </div>

              {addedToast && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200 animate-in fade-in">
                  ✓ Silhouette added to your Shopping Bag!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

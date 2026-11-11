import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Eye,
  MessageCircle,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { Product } from '../../types';

interface ProductGridProps {
  products: Product[];
  selectedCategory: string;
  searchQuery: string;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onInstantWhatsAppOrder: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCategory,
  searchQuery,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onAddToCart,
  onInstantWhatsAppOrder,
}) => {
  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [selectedDeliverable, setSelectedDeliverable] = useState<'all' | 'stitched' | 'unstitched'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Filter & Search Logic
  const filteredProducts = products.filter((p) => {
    // Exclude hidden or deleted silhouettes from boutique storefront
    if (p.visible === false || p.isDeleted) return false;

    // Category filter
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchFabric = p.fabric.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSku && !matchFabric && !matchTags) return false;
    }

    // Fabric filter
    if (selectedFabric !== 'all') {
      if (!p.fabric.toLowerCase().includes(selectedFabric.toLowerCase())) {
        return false;
      }
    }

    // Deliverable filter
    if (selectedDeliverable === 'stitched' && !p.deliverables.stitched) return false;
    if (selectedDeliverable === 'unstitched' && !p.deliverables.unstitched) return false;

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // featured/default
  });

  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Catalog Context & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#D4C3B9]/50">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F] block mb-1">
            Official SAHARISH Atelier Catalog
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#42240D] tracking-tight">
            {selectedCategory === 'all' ? "Ladies' Luxury Pret & Couture" : selectedCategory}
          </h2>
          <p className="text-xs text-[#50443D] mt-1">
            Displaying {sortedProducts.length} of {products.length} artisanal silhouettes. Handcrafted with fine handloom fabrics.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Fabric Filter */}
          <select
            value={selectedFabric}
            onChange={(e) => setSelectedFabric(e.target.value)}
            className="px-3 py-2 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#42240D] font-medium focus:outline-none focus:border-[#5C3A21] shadow-sm"
          >
            <option value="all">All Fabrics</option>
            <option value="silk">Raw &amp; Slub Silk</option>
            <option value="organza">Organza Jacquard</option>
            <option value="lawn">Pure Lawn</option>
            <option value="chiffon">Chiffon</option>
          </select>

          {/* Deliverable Filter */}
          <select
            value={selectedDeliverable}
            onChange={(e) => setSelectedDeliverable(e.target.value as any)}
            className="px-3 py-2 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#42240D] font-medium focus:outline-none focus:border-[#5C3A21] shadow-sm"
          >
            <option value="all">Stitched &amp; Unstitched</option>
            <option value="stitched">Ready-to-Wear (Stitched)</option>
            <option value="unstitched">Unstitched Fabric Pack</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#42240D] font-medium focus:outline-none focus:border-[#5C3A21] shadow-sm"
          >
            <option value="featured">Sort: Featured Collection</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Grid of Outfits */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#D4C3B9]/50 p-8 space-y-3">
          <Sparkles className="w-10 h-10 text-[#C49A6C] mx-auto" />
          <h3 className="font-serif text-xl font-bold text-[#42240D]">No silhouettes found</h3>
          <p className="text-xs text-[#50443D] max-w-md mx-auto">
            Try adjusting your fabric or category filters, or search for another couture term.
          </p>
          <button
            onClick={() => {
              setSelectedFabric('all');
              setSelectedDeliverable('all');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5C3A21] text-white text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {sortedProducts.map((p) => {
            const isWishlisted = wishlistIds.includes(p.id);
            return (
              <div
                key={p.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#D4C3B9]/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF7F2]">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-extrabold tracking-wider shadow-sm ${
                          p.status === 'LOW STOCK'
                            ? 'bg-[#FFDAD6] text-[#93000A]'
                            : 'bg-[#FAF7F2]/95 text-[#42240D] border border-[#C49A6C]/40'
                        }`}
                      >
                        {p.status}
                      </span>
                      {p.compareAtPrice > p.price && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FECF9D] text-[#79562E] text-[9px] uppercase font-bold tracking-wider">
                          12% Festive Off
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => onToggleWishlist(p.id)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#42240D] flex items-center justify-center shadow-md transition-transform active:scale-90"
                      aria-label="Wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isWishlisted ? 'fill-[#BA1A1A] text-[#BA1A1A]' : 'text-[#50443D]'
                        }`}
                      />
                    </button>

                    {/* Quick View Overlay on hover */}
                    <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                      <button
                        onClick={() => onSelectProduct(p)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-white/95 hover:bg-white text-[#42240D] text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Eye className="w-4 h-4 text-[#5C3A21]" />
                        <span>Quick Atelier View</span>
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#7A582F] tracking-wider">
                      <span>{p.category}</span>
                      <span className="font-mono text-[#82746C]">{p.sku}</span>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(p)}
                      className="font-serif text-base sm:text-lg font-bold text-[#42240D] hover:text-[#5C3A21] cursor-pointer line-clamp-1 transition-colors"
                    >
                      {p.title}
                    </h3>

                    <p className="text-xs text-[#50443D] line-clamp-1">
                      {p.fabric}
                    </p>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="font-serif text-lg sm:text-xl font-bold text-[#42240D]">
                        PKR {p.price.toLocaleString()}
                      </span>
                      {p.compareAtPrice > p.price && (
                        <span className="text-xs text-[#82746C] line-through">
                          PKR {p.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onAddToCart(p)}
                    className="w-full py-2.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#C49A6C]" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    onClick={() => onInstantWhatsAppOrder(p)}
                    className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    title="Order directly with styling concierge"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white stroke-none" />
                    <span>WhatsApp Order</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

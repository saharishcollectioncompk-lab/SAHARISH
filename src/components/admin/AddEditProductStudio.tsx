import React, { useState } from 'react';
import {
  Save,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Upload,
  ArrowLeft,
  X,
} from 'lucide-react';
import { Product, ProductSize, SizeStock } from '../../types';
import { storageService } from '../../services/storageService';

interface AddEditProductStudioProps {
  initialProduct?: Product | null;
  onSaved: (product: Product) => void;
  onCancel: () => void;
}

export const AddEditProductStudio: React.FC<AddEditProductStudioProps> = ({
  initialProduct,
  onSaved,
  onCancel,
}) => {
  const isEditing = Boolean(initialProduct);

  const [title, setTitle] = useState(
    initialProduct?.title || 'Mehrunissa Ivory Heavy Embroidered 3-Piece Pret'
  );
  const [sku, setSku] = useState(initialProduct?.sku || 'SAH-2025-IV05');
  const [category, setCategory] = useState<Product['category']>(
    initialProduct?.category || 'Festive Luxury Pret'
  );
  const [fabric, setFabric] = useState(
    initialProduct?.fabric || 'Pure Slub Silk & Organza Jacquard'
  );
  const [price, setPrice] = useState(initialProduct?.price || 18500);
  const [compareAtPrice, setCompareAtPrice] = useState(initialProduct?.compareAtPrice || 21000);
  const [costPrice, setCostPrice] = useState(initialProduct?.costPrice || 9250);

  // Narratives
  const [shirtDesc, setShirtDesc] = useState(
    initialProduct?.description?.shirt ||
      'Pure Slub Silk straight-cut long silhouette rendered in antique ivory. Intricate floral tree-of-life motifs intricately hand-embroidered using delicate resham threads, marori tilla cords, and subtle mirror-work tassels along the scalloped hemline.'
  );
  const [dupattaDesc, setDupattaDesc] = useState(
    initialProduct?.description?.dupatta ||
      'Handloom woven organza dupatta richly patterned with botanical jaal panels, artisanal kashmiri stitches, and finished with contrasting coral piping borders.'
  );
  const [trouserDesc, setTrouserDesc] = useState(
    initialProduct?.description?.trouser ||
      'Pure Korean raw silk pleated palazzo flared trousers with pintuck inserts.'
  );
  const [careDesc, setCareDesc] = useState(
    initialProduct?.description?.care ||
      'Dry clean only. Handle heirloom hand embellishments with utmost atelier care.'
  );

  // Deliverables
  const [stitchedDeliverable, setStitchedDeliverable] = useState(
    initialProduct?.deliverables?.stitched ?? true
  );
  const [unstitchedDeliverable, setUnstitchedDeliverable] = useState(
    initialProduct?.deliverables?.unstitched ?? true
  );

  // WhatsApp Concierge
  const [instantWhatsApp, setInstantWhatsApp] = useState(
    initialProduct?.instantWhatsAppOrder ?? true
  );

  // Status
  const [status, setStatus] = useState<Product['status']>(
    initialProduct?.status || 'IN STOCK'
  );

  // Images
  const [images, setImages] = useState<string[]>(
    initialProduct?.images || [
      '/assets/aistudio/images__3__b7c950ec.jpe',
      '/assets/aistudio/images__12__f494b196.jpe',
      '/assets/aistudio/images__13__bfb88e9d.jpe',
    ]
  );

  // Sizing Matrix
  const [sizeStocks, setSizeStocks] = useState<Record<ProductSize, SizeStock>>(
    initialProduct?.sizeStocks || {
      XS: { size: 'XS', label: 'XS (34)', stock: 12, priceOffset: 0, barcode: '896400238101' },
      S: { size: 'S', label: 'S (36)', stock: 28, priceOffset: 0, barcode: '896400238102' },
      M: { size: 'M', label: 'M (38)', stock: 35, priceOffset: 0, barcode: '896400238103' },
      L: { size: 'L', label: 'L (40)', stock: 18, priceOffset: 0, barcode: '896400238104' },
      XL: { size: 'XL', label: 'XL (42)', stock: 5, priceOffset: 0, barcode: '896400238105' },
    }
  );

  const [toastMessage, setToastMessage] = useState(false);

  const handleStockChange = (sz: ProductSize, newStock: number) => {
    setSizeStocks((prev) => ({
      ...prev,
      [sz]: {
        ...prev[sz],
        stock: Math.max(0, newStock),
      },
    }));
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();

    const productToSave: Product = {
      id: initialProduct?.id || `prod-${Date.now()}`,
      title,
      sku,
      category,
      fabric,
      price: Number(price),
      compareAtPrice: Number(compareAtPrice),
      costPrice: Number(costPrice),
      images,
      description: {
        shirt: shirtDesc,
        dupatta: dupattaDesc,
        trouser: trouserDesc,
        care: careDesc,
      },
      sizeStocks,
      deliverables: {
        stitched: stitchedDeliverable,
        unstitched: unstitchedDeliverable,
      },
      tags: ['PURE SLUB SILK', 'ORGANZA JACQUARD', 'RAW SILK TROUSER'],
      instantWhatsAppOrder: instantWhatsApp,
      status,
      featured: true,
    };

    const existing = storageService.getProducts();
    let updated: Product[];
    if (isEditing) {
      updated = existing.map((p) => (p.id === productToSave.id ? productToSave : p));
    } else {
      updated = [productToSave, ...existing];
    }

    storageService.saveProducts(updated);
    setToastMessage(true);
    setTimeout(() => {
      onSaved(productToSave);
    }, 1200);
  };

  return (
    <form onSubmit={handlePublish} className="space-y-8 pb-16">
      {/* Studio Top Context & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={onCancel}
              className="text-[#7A582F] hover:text-[#42240D] flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Products</span>
            </button>
            <span className="text-[#82746C]">/</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#82746C]">
              Atelier Catalog Studio
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#42240D]">
            {isEditing ? `Edit: ${title}` : 'Add & Edit Product Studio'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {toastMessage && (
            <span className="text-xs text-emerald-800 font-bold flex items-center gap-1 bg-emerald-100 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" /> Published to Boutique!
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-[#C49A6C]" />
            <span>{isEditing ? 'Save Silhouette Changes' : 'Publish to Live Boutique'}</span>
          </button>
        </div>
      </div>

      {/* Main Dual Grid Layout (Matches code_6fffc3de.html) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Identification, Narratives, Photos, Valuation, Sizing */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Couture Article Identification */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D4C3B9]/50 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE9]">
              <h3 className="font-serif text-lg font-bold text-[#42240D]">
                Couture Article Identification
              </h3>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#7A582F]">
                Serial Master
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase font-bold text-[#42240D] mb-1">
                  Product Title &amp; Silhouette Name *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#42240D] mb-1">
                  Artisanal SKU Code *
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs font-mono font-bold text-[#42240D]"
                  required
                />
              </div>
            </div>

            {/* Textile Composition Narrative */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs uppercase font-bold text-[#42240D]">
                Textile Composition, Threadwork &amp; Silhouette Narrative
              </label>

              <div>
                <span className="text-[11px] font-bold text-[#7A582F] block mb-0.5">Shirt Details:</span>
                <textarea
                  value={shirtDesc}
                  onChange={(e) => setShirtDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] resize-none"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#7A582F] block mb-0.5">Dupatta Draped Fall:</span>
                <textarea
                  value={dupattaDesc}
                  onChange={(e) => setDupattaDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] resize-none"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#7A582F] block mb-0.5">Trouser &amp; Care:</span>
                <textarea
                  value={trouserDesc}
                  onChange={(e) => setTrouserDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Lookbook Photography */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D4C3B9]/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE9]">
              <h3 className="font-serif text-lg font-bold text-[#42240D]">
                Lookbook Photography &amp; Editorial Drapes
              </h3>
              <span className="text-xs text-[#82746C]">{images.length} Loaded</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#D4C3B9]">
                  <img src={img} alt={`Asset ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] uppercase font-bold">
                    {idx === 0 ? 'Hero Cover' : `Angle 0${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Commercial Valuation */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D4C3B9]/50 shadow-sm space-y-5">
            <h3 className="font-serif text-lg font-bold text-[#42240D]">
              Commercial Valuation &amp; Silhouette Execution
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-[#42240D] mb-1">
                  Retail Price (PKR) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs font-bold text-[#42240D]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#42240D] mb-1">
                  Compare-At / Strike-through
                </label>
                <input
                  type="number"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#82746C]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#42240D] mb-1">
                  Atelier Production Cost
                </label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#50443D]"
                />
              </div>
            </div>

            {/* Deliverables Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#D4C3B9]/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stitchedDeliverable}
                  onChange={(e) => setStitchedDeliverable(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#5C3A21] accent-[#5C3A21]"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#42240D]">Ready-to-Wear (Stitched Silhouette)</span>
                  <p className="text-[10px] text-[#82746C] mt-0.5">
                    Precision cut and tailored master fit with custom inner linings and hand-finished lace trimmings.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#D4C3B9]/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unstitchedDeliverable}
                  onChange={(e) => setUnstitchedDeliverable(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#5C3A21] accent-[#5C3A21]"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#42240D]">Unstitched Fabric Pack</span>
                  <p className="text-[10px] text-[#82746C] mt-0.5">
                    Raw silk shirt panels (3.25m), embroidered organza dupatta (2.75m), and unstitched raw silk trouser piece (2.5m).
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Sizing Matrix & Inventory Quantities */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D4C3B9]/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE9]">
              <h3 className="font-serif text-lg font-bold text-[#42240D]">
                Sizing Matrix &amp; Inventory Quantities
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A582F]">
                Haute Pret Sizing
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#FAF7F2] text-[#7A582F] uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3 text-left">Size</th>
                    <th className="p-3 text-left">Variant SKU</th>
                    <th className="p-3 text-left">Stock Count</th>
                    <th className="p-3 text-left">Barcode</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDE9]">
                  {(['XS', 'S', 'M', 'L', 'XL'] as ProductSize[]).map((sz) => {
                    const item = sizeStocks[sz];
                    return (
                      <tr key={sz}>
                        <td className="p-3 font-bold text-[#42240D]">{item.label}</td>
                        <td className="p-3 font-mono text-[#82746C]">{sku}-{sz}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            min={0}
                            value={item.stock}
                            onChange={(e) => handleStockChange(sz, Number(e.target.value))}
                            className="w-20 p-1.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-lg text-center font-bold text-[#42240D]"
                          />
                        </td>
                        <td className="p-3 font-mono text-[#82746C]">{item.barcode}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.stock <= 2
                                ? 'bg-red-100 text-red-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.stock <= 2 ? 'Low Stock' : 'Optimal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Organization, WhatsApp Concierge, Visibility */}
        <div className="lg:col-span-4 space-y-8">
          {/* Organization & Capsule */}
          <div className="bg-white rounded-2xl p-6 border border-[#D4C3B9]/50 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-[#42240D]">
              Organization &amp; Capsule
            </h3>

            <div>
              <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                Assigned Collection
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#42240D]"
              >
                <option value="Festive Luxury Pret">Festive Luxury Pret</option>
                <option value="Pastel Lawn & Organza">Pastel Lawn &amp; Organza</option>
                <option value="Chikankari & Cutwork">Chikankari &amp; Cutwork</option>
                <option value="Royal Monochromes">Royal Monochromes</option>
                <option value="Daily Luxury Lawn">Daily Luxury Lawn</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                Fabric Details
              </label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
              />
            </div>
          </div>

          {/* WhatsApp Concierge VIP Feature */}
          <div className="bg-white rounded-2xl p-6 border border-[#D4C3B9]/50 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif text-base font-bold text-[#42240D]">
                  WhatsApp Concierge
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#FFDCC6] text-[#2F1502]">
                VIP Feature
              </span>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#D4C3B9]/60 cursor-pointer">
              <div className="text-xs">
                <div className="font-bold text-[#42240D]">Instant WhatsApp Order</div>
                <div className="text-[10px] text-[#82746C]">Route orders directly to 03097309810 (+92 309 7309810)</div>
              </div>
              <input
                type="checkbox"
                checked={instantWhatsApp}
                onChange={(e) => setInstantWhatsApp(e.target.checked)}
                className="w-4 h-4 text-[#5C3A21] accent-[#5C3A21] rounded"
              />
            </label>
            <p className="text-[11px] text-[#82746C] leading-snug">
              Enables high-touch bespoke measurement requests and overseas bridal payments via concierge agents.
            </p>
          </div>

          {/* Visibility & Status */}
          <div className="bg-white rounded-2xl p-6 border border-[#D4C3B9]/50 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-[#42240D]">
              Visibility &amp; Release
            </h3>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-[#42240D] cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'IN STOCK'}
                  onChange={() => setStatus('IN STOCK')}
                  className="text-[#5C3A21] accent-[#5C3A21]"
                />
                <span>Publish Live Immediately</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#42240D] cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'LOW STOCK'}
                  onChange={() => setStatus('LOW STOCK')}
                  className="text-[#5C3A21] accent-[#5C3A21]"
                />
                <span>Flag as Critical / Low Stock</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#42240D] cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'ARCHIVED'}
                  onChange={() => setStatus('ARCHIVED')}
                  className="text-[#5C3A21] accent-[#5C3A21]"
                />
                <span>Archive into Atelier Vault</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-[#C49A6C]" />
              <span>Publish to Live Boutique</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

import React, { useState, useEffect } from 'react';
import {
  FileDown,
  Sliders,
  Plus,
  Search,
  Filter,
  Edit,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Product } from '../../types';
import { storageService } from '../../services/storageService';

interface ProductsInventoryViewProps {
  onAddProductClick: () => void;
  onEditProductClick: (product: Product) => void;
  onProductDeleted?: (id: string) => void;
  onGoToTrash?: () => void;
}

export const ProductsInventoryView: React.FC<ProductsInventoryViewProps> = ({
  onAddProductClick,
  onEditProductClick,
  onProductDeleted,
  onGoToTrash,
}) => {
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [search, setSearch] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Delete Confirmation Modal & Feedback State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Sync state if products are updated elsewhere in the application
  useEffect(() => {
    const handleProductsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ products?: Product[] }>;
      if (customEvent.detail?.products) {
        setProducts(customEvent.detail.products);
      } else {
        setProducts(storageService.getProducts());
      }
    };
    window.addEventListener('saharish_products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('saharish_products_updated', handleProductsUpdated);
    };
  }, []);

  // Auto-dismiss feedback message after 4.5 seconds
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const totalSilhouettes = products.length;
  const inStockUnits = products.reduce((acc, p) => {
    return (
      acc +
      Object.values(p.sizeStocks).reduce((szAcc, sz) => szAcc + sz.stock, 0)
    );
  }, 0);
  const lowStockCount = products.filter((p) => p.status === 'LOW STOCK').length;

  const filtered = products.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (collectionFilter !== 'all' && p.category !== collectionFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const result = storageService.deleteProduct(productToDelete.id);
      if (result.success) {
        // Immediately update the products list without requiring a page refresh
        const remaining = storageService.getProducts();
        setProducts(remaining);
        onProductDeleted?.(productToDelete.id);

        setFeedbackMessage({
          type: 'success',
          text: 'Product deleted successfully!',
        });
        setProductToDelete(null);
      } else {
        setFeedbackMessage({
          type: 'error',
          text: result.message || 'Failed to delete product. Please try again.',
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'An unexpected error occurred while deleting the product.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = (prod: Product) => {
    const copy: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      sku: `${prod.sku}-CP`,
      title: `${prod.title} (Atelier Copy)`,
    };
    const updated = [copy, ...products];
    setProducts(updated);
    storageService.saveProducts(updated);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Context & Action Banner (Matches code_2b239883.html) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
              Atelier Catalog Management
            </span>
            <span className="w-1 h-1 rounded-full bg-[#D4C3B9]"></span>
            <span className="text-[10px] uppercase tracking-wider text-[#82746C]">
              SS 2025 Volume I
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#42240D] tracking-tight">
            Products &amp; Atelier Inventory
          </h1>
          <p className="text-xs text-[#50443D] max-w-2xl">
            Manage ladies' pret, festive couture, and unstitched artisanal silhouettes. Monitor SKU allocation, fabric details, and real-time boutique stock.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onGoToTrash && (
            <button
              onClick={onGoToTrash}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#BA1A1A] border border-[#D4C3B9] text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>View Trash</span>
            </button>
          )}

          <button
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                ['SKU,Title,Category,Price,TotalStock,Status']
                  .concat(
                    products.map(
                      (p) =>
                        `"${p.sku}","${p.title}","${p.category}",${p.price},${Object.values(p.sizeStocks).reduce((a, b) => a + b.stock, 0)},"${p.status}"`
                    )
                  )
                  .join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', 'saharish_atelier_inventory.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#42240D] border border-[#D4C3B9] text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
          >
            <FileDown className="w-4 h-4 text-[#7A582F]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onAddProductClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
          >
            <Plus className="w-4 h-4 text-[#C49A6C]" />
            <span>+ Add New Product</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast / Alert Banner */}
      {feedbackMessage && (
        <div
          role="alert"
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs border shadow-sm ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          } animate-in fade-in duration-200`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="font-semibold text-sm">{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-current opacity-60 hover:opacity-100 p-1 rounded-lg"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Key Metrics Bento Row (Matches code_2b239883.html) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white border border-[#D4C3B9]/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#82746C]">
              Total Active Catalog
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FECF9D]/40 text-[#42240D] flex items-center justify-center font-bold text-xs">
              👗
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="font-serif text-2xl font-bold text-[#42240D]">
                {totalSilhouettes}
              </span>
              <span className="text-xs text-[#82746C] ml-1">Silhouettes</span>
            </div>
            <span className="text-[10px] font-bold text-[#7A582F]">+2 Pre-launch</span>
          </div>
          <div className="w-full bg-[#F0EDE9] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#5C3A21] h-full w-[85%] rounded-full"></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white border border-[#D4C3B9]/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#82746C]">
              In Stock &amp; Ready to Ship
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FECF9D]/40 text-[#42240D] flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="font-serif text-2xl font-bold text-[#42240D]">
                {inStockUnits}
              </span>
              <span className="text-xs text-[#82746C] ml-1">Units Total</span>
            </div>
            <span className="text-[10px] text-[#82746C]">Across XS-XL</span>
          </div>
          <div className="w-full bg-[#F0EDE9] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-600 h-full w-[75%] rounded-full"></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white border border-[#D4C3B9]/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#82746C]">
              Low Stock Watchlist
            </span>
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="font-serif text-2xl font-bold text-[#BA1A1A]">
                {lowStockCount}
              </span>
              <span className="text-xs text-[#82746C] ml-1">Silhouettes</span>
            </div>
            <span className="text-[10px] font-bold text-[#BA1A1A]">Critical restock</span>
          </div>
          <div className="text-[11px] text-[#82746C] mt-2 truncate">
            Mehrunissa, Sapphire &amp; Lavender
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white border border-[#D4C3B9]/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#82746C]">
              Vault / Archived
            </span>
            <div className="w-8 h-8 rounded-full bg-[#EBE8E3] text-[#50443D] flex items-center justify-center text-xs font-bold">
              📦
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="font-serif text-2xl font-bold text-[#50443D]">1</span>
              <span className="text-xs text-[#82746C] ml-1">Retired</span>
            </div>
            <span className="text-[10px] text-[#82746C]">Seasonal Wrap</span>
          </div>
          <div className="w-full bg-[#F0EDE9] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#82746C] h-full w-[12%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#D4C3B9]/50 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#82746C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by SKU or Couture name..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19] focus:outline-none focus:border-[#5C3A21]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#42240D]"
          >
            <option value="all">All Collections</option>
            <option value="Festive Luxury Pret">Festive Luxury Pret</option>
            <option value="Pastel Lawn & Organza">Pastel Lawn &amp; Organza</option>
            <option value="Chikankari & Cutwork">Chikankari &amp; Cutwork</option>
            <option value="Royal Monochromes">Royal Monochromes</option>
            <option value="Daily Luxury Lawn">Daily Luxury Lawn</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#42240D]"
          >
            <option value="all">All Statuses</option>
            <option value="IN STOCK">In Stock</option>
            <option value="LOW STOCK">Low Stock</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {(search || collectionFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setCollectionFilter('all');
                setStatusFilter('all');
              }}
              className="p-2 text-[#82746C] hover:text-[#42240D]"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Products Table (Matches code_2b239883.html Table Architecture) */}
      <div className="bg-white rounded-2xl border border-[#D4C3B9]/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#7A582F] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E2DD]">
              <tr>
                <th className="py-3.5 px-4">Preview</th>
                <th className="py-3.5 px-4">Design &amp; SKU</th>
                <th className="py-3.5 px-4">Collection &amp; Fabric</th>
                <th className="py-3.5 px-4">Retail Price</th>
                <th className="py-3.5 px-4">Atelier Stock Breakdown</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE9]">
              {filtered.map((p) => {
                const totalStock = Object.values(p.sizeStocks).reduce((a, b) => a + b.stock, 0);
                return (
                  <tr key={p.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    {/* Preview Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-[#F0EDE9] border border-[#D4C3B9]/40">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Title & SKU */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-sm text-[#42240D]">{p.title}</div>
                      <div className="text-[10px] font-mono text-[#82746C] mt-0.5">
                        SKU: {p.sku}
                      </div>
                    </td>

                    {/* Collection & Fabric */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#7A582F]">{p.category}</div>
                      <div className="text-[11px] text-[#82746C] line-clamp-1">{p.fabric}</div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <div className="font-serif font-bold text-sm text-[#42240D]">
                        PKR {p.price.toLocaleString()}
                      </div>
                      {p.compareAtPrice > p.price && (
                        <div className="text-[10px] text-[#82746C] line-through">
                          PKR {p.compareAtPrice.toLocaleString()}
                        </div>
                      )}
                    </td>

                    {/* Stock Matrix XS-XL */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-[#42240D] mb-1">
                        <span>{totalStock} Units Total</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#50443D] font-mono">
                        <span>XS:{p.sizeStocks.XS.stock}</span>
                        <span>·</span>
                        <span>S:{p.sizeStocks.S.stock}</span>
                        <span>·</span>
                        <span>M:{p.sizeStocks.M.stock}</span>
                        <span>·</span>
                        <span>L:{p.sizeStocks.L.stock}</span>
                        <span>·</span>
                        <span>XL:{p.sizeStocks.XL.stock}</span>
                      </div>
                    </td>

                    {/* Status Chip */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                          p.status === 'IN STOCK'
                            ? 'bg-[#FFDCC6] text-[#2F1502]'
                            : p.status === 'LOW STOCK'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const res = storageService.toggleProductVisibility(p.id);
                            if (res.success) {
                              setProducts(storageService.getProducts(false));
                              setFeedbackMessage({
                                type: 'success',
                                text: `Product visibility set to ${res.visible ? 'Visible' : 'Hidden'}.`,
                              });
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.visible !== false
                              ? 'text-[#50443D] hover:text-[#42240D] hover:bg-[#F0EDE9]'
                              : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                          }`}
                          title={p.visible !== false ? 'Hide Product from Store' : 'Unhide Product'}
                          aria-label={p.visible !== false ? 'Hide Product' : 'Unhide Product'}
                        >
                          {p.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => onEditProductClick(p)}
                          className="p-1.5 rounded-lg text-[#50443D] hover:text-[#42240D] hover:bg-[#F0EDE9]"
                          title="Edit Outfit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 rounded-lg text-[#50443D] hover:text-[#42240D] hover:bg-[#F0EDE9]"
                          title="Duplicate SKU"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 rounded-lg text-[#82746C] hover:text-[#BA1A1A] hover:bg-red-50 transition-colors"
                          title="Delete Product"
                          aria-label={`Delete ${p.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Popup Modal exactly per requirements:
          - Question: "Are you sure you want to delete this product?"
          - Two buttons: Cancel and Yes, Delete
      */}
      {productToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-[#C49A6C] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-700" />
                </div>
                <div>
                  <h3 id="delete-dialog-title" className="font-serif text-lg font-bold text-[#42240D]">
                    Confirm Deletion
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-red-700">
                    Permanent Removal
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="text-[#82746C] hover:text-[#42240D] p-1 rounded-full transition-colors"
                aria-label="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-sm text-[#42240D]">
                Are you sure you want to delete this product?
              </p>
              <p className="text-xs text-[#50443D] leading-relaxed">
                This will permanently delete this silhouette from the database, remove it from the customer-facing Shop page, and remove it from associated collections.
              </p>
            </div>

            {/* Selected Product Summary Card */}
            <div className="flex items-center gap-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#D4C3B9]/60">
              <img
                src={productToDelete.images[0]}
                alt={productToDelete.title}
                className="w-12 h-16 object-cover rounded-lg border border-[#D4C3B9] shrink-0"
              />
              <div className="flex-1 min-w-0 text-xs">
                <h4 className="font-serif font-bold text-[#42240D] truncate">
                  {productToDelete.title}
                </h4>
                <div className="text-[10px] font-mono text-[#82746C] mt-0.5">
                  SKU: {productToDelete.sku}
                </div>
                <div className="text-[10px] text-[#7A582F] font-semibold mt-0.5">
                  {productToDelete.category} · PKR {productToDelete.price.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Two buttons: Cancel and Yes, Delete */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="w-full py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EDE9] border border-[#D4C3B9] text-xs font-bold uppercase tracking-wider text-[#42240D] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="w-full py-2.5 rounded-xl bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Search,
  FolderOpen,
  ShoppingBag,
  X,
  ShieldAlert,
} from 'lucide-react';
import { Collection, Product } from '../../types';
import { storageService } from '../../services/storageService';

export const TrashManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'collections' | 'products'>('collections');
  const [trashCollections, setTrashCollections] = useState<Collection[]>(() =>
    storageService.getTrashCollections()
  );
  const [trashProducts, setTrashProducts] = useState<Product[]>(() =>
    storageService.getTrashProducts()
  );
  const [search, setSearch] = useState('');

  // Confirmation Modals
  const [permanentlyDeletingItem, setPermanentlyDeletingItem] = useState<{
    type: 'collection' | 'product';
    id: string;
    name: string;
  } | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const refreshTrashData = () => {
    setTrashCollections(storageService.getTrashCollections());
    setTrashProducts(storageService.getTrashProducts());
  };

  useEffect(() => {
    refreshTrashData();
    const handleProductsUpdated = () => refreshTrashData();
    const handleCollectionsUpdated = () => refreshTrashData();

    window.addEventListener('saharish_products_updated', handleProductsUpdated);
    window.addEventListener('saharish_collections_updated', handleCollectionsUpdated);
    return () => {
      window.removeEventListener('saharish_products_updated', handleProductsUpdated);
      window.removeEventListener('saharish_collections_updated', handleCollectionsUpdated);
    };
  }, []);

  const handleRestoreCollection = (id: string, name: string) => {
    const res = storageService.restoreCollection(id);
    if (res.success) {
      setFeedback({
        type: 'success',
        text: `Collection "${name}" restored successfully to active lookbooks!`,
      });
      refreshTrashData();
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleRestoreProduct = (id: string, title: string) => {
    const res = storageService.restoreProduct(id);
    if (res.success) {
      setFeedback({
        type: 'success',
        text: `Product "${title}" restored to active boutique catalog!`,
      });
      refreshTrashData();
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleConfirmPermanentDelete = () => {
    if (!permanentlyDeletingItem) return;

    if (permanentlyDeletingItem.type === 'collection') {
      const res = storageService.permanentlyDeleteCollection(permanentlyDeletingItem.id);
      if (res.success) {
        setFeedback({
          type: 'success',
          text: `Collection "${permanentlyDeletingItem.name}" permanently purged from database.`,
        });
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } else {
      const res = storageService.permanentlyDeleteProduct(permanentlyDeletingItem.id);
      if (res.success) {
        setFeedback({
          type: 'success',
          text: `Product "${permanentlyDeletingItem.name}" permanently purged from database.`,
        });
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    }

    setPermanentlyDeletingItem(null);
    refreshTrashData();
  };

  const handleEmptyTrash = () => {
    if (activeTab === 'collections') {
      trashCollections.forEach((c) => storageService.permanentlyDeleteCollection(c.id));
      setFeedback({ type: 'success', text: 'All deleted collections permanently purged.' });
    } else {
      trashProducts.forEach((p) => storageService.permanentlyDeleteProduct(p.id));
      setFeedback({ type: 'success', text: 'All deleted products permanently purged.' });
    }
    refreshTrashData();
  };

  const filteredCollections = trashCollections.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

  const filteredProducts = trashProducts.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.fabric.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
              Atelier Database Archive
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#42240D] tracking-tight">
            Trash &amp; Deleted Items
          </h1>
          <p className="text-xs text-[#50443D] max-w-2xl mt-1">
            Items deleted from the Admin Dashboard are securely preserved here. You can restore them to active boutique status or permanently purge them from the database.
          </p>
        </div>

        {((activeTab === 'collections' && trashCollections.length > 0) ||
          (activeTab === 'products' && trashProducts.length > 0)) && (
          <button
            type="button"
            onClick={handleEmptyTrash}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#BA1A1A] border border-red-200 text-xs font-bold uppercase tracking-wider transition-colors self-start md:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty {activeTab === 'collections' ? 'Collections Trash' : 'Products Trash'}</span>
          </button>
        )}
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold border shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-current opacity-60 hover:opacity-100 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between gap-4 border-b border-[#D4C3B9]/50 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('collections')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'collections'
                ? 'bg-[#5C3A21] text-white shadow-sm'
                : 'bg-white hover:bg-[#FAF7F2] text-[#50443D] border border-[#D4C3B9]'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Deleted Collections ({trashCollections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'products'
                ? 'bg-[#5C3A21] text-white shadow-sm'
                : 'bg-white hover:bg-[#FAF7F2] text-[#50443D] border border-[#D4C3B9]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Deleted Products ({trashProducts.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-64 hidden sm:block">
          <Search className="w-3.5 h-3.5 text-[#82746C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deleted items..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
          />
        </div>
      </div>

      {/* Tab 1: Deleted Collections */}
      {activeTab === 'collections' && (
        <div>
          {filteredCollections.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#D4C3B9]/50 p-8 space-y-2">
              <Sparkles className="w-8 h-8 text-[#C49A6C] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#42240D]">Trash is empty</h3>
              <p className="text-xs text-[#82746C]">
                No deleted collections currently in trash. Active collections will appear here if removed from the dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollections.map((col) => (
                <div
                  key={col.id}
                  className="bg-white rounded-2xl p-4 border border-red-200 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-[#FAF7F2]">
                      <img
                        src={col.coverImage}
                        alt={col.name}
                        className="w-full h-full object-cover grayscale opacity-80"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[9px] font-bold uppercase tracking-wider">
                        Deleted
                      </span>
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
                      {col.category} · {col.slot}
                    </span>
                    <h3 className="font-serif text-base font-bold text-[#42240D]">{col.name}</h3>
                    <p className="text-xs text-[#82746C] line-clamp-2">{col.tagline}</p>
                    {col.deletedAt && (
                      <span className="text-[10px] text-[#82746C] block">
                        Deleted: {new Date(col.deletedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#F0EDE9] grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRestoreCollection(col.id, col.name)}
                      className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPermanentlyDeletingItem({
                          type: 'collection',
                          id: col.id,
                          name: col.name,
                        })
                      }
                      className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-[#BA1A1A] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Deleted Products */}
      {activeTab === 'products' && (
        <div>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#D4C3B9]/50 p-8 space-y-2">
              <Sparkles className="w-8 h-8 text-[#C49A6C] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#42240D]">Trash is empty</h3>
              <p className="text-xs text-[#82746C]">
                No deleted products currently in trash.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#7A582F] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E2DD]">
                    <tr>
                      <th className="py-3 px-4">Preview</th>
                      <th className="py-3 px-4">Title &amp; SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Deleted At</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EDE9]">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-red-50/30 transition-colors">
                        <td className="py-3 px-4">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-12 h-16 rounded-lg object-cover grayscale opacity-80 border border-[#D4C3B9]"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#42240D]">{p.title}</div>
                          <div className="text-[10px] font-mono text-[#82746C]">SKU: {p.sku}</div>
                        </td>
                        <td className="py-3 px-4 text-[#7A582F] font-semibold">{p.category}</td>
                        <td className="py-3 px-4 font-serif font-bold text-[#42240D]">
                          PKR {p.price.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-[#82746C]">
                          {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRestoreProduct(p.id, p.title)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPermanentlyDeletingItem({
                                  type: 'product',
                                  id: p.id,
                                  name: p.title,
                                })
                              }
                              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#BA1A1A] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Purge</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Permanently Delete Confirmation Modal */}
      {permanentlyDeletingItem && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-red-300 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#42240D]">
                  Permanently Purge Item
                </h3>
                <span className="text-[10px] uppercase font-bold text-red-700">
                  Irreversible Database Action
                </span>
              </div>
            </div>

            <p className="text-xs text-[#50443D] leading-relaxed">
              Are you sure you want to permanently delete <strong>"{permanentlyDeletingItem.name}"</strong>?
              This will completely remove it from the system and prevent it from ever resurrecting.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPermanentlyDeletingItem(null)}
                className="py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EDE9] border border-[#D4C3B9] text-xs font-bold uppercase tracking-wider text-[#42240D]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                className="py-2.5 rounded-xl bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Permanently Purge</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

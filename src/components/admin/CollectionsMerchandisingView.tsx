import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Link,
  CheckCircle2,
  Save,
  MessageCircle,
  Mail,
  Share2,
  Phone,
  Camera,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Plus,
  Search,
  RotateCcw,
  AlertTriangle,
  FolderPlus,
  ShoppingBag,
  X,
  Layers,
} from 'lucide-react';
import { Collection, AdminSettings, Product } from '../../types';
import { storageService } from '../../services/storageService';

interface CollectionsMerchandisingViewProps {
  onGoToTrash?: () => void;
}

export const CollectionsMerchandisingView: React.FC<CollectionsMerchandisingViewProps> = ({
  onGoToTrash,
}) => {
  const [collections, setCollections] = useState<Collection[]>(() =>
    storageService.getCollections(false)
  );
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts(false));
  const [settings, setSettings] = useState<AdminSettings>(() => storageService.getAdminSettings());
  const [search, setSearch] = useState('');

  // Hero Banner Form State
  const [bannerTitle, setBannerTitle] = useState(settings.bannerTitle);
  const [bannerUrl, setBannerUrl] = useState(settings.bannerCtaUrl);
  const [bannerBtn, setBannerBtn] = useState(settings.bannerButtonLabel);
  const [bannerToast, setBannerToast] = useState(false);

  // Atelier Contact Form State
  const [contactToast, setContactToast] = useState(false);
  const [line1, setLine1] = useState(settings.adminPhone1.number);
  const [line2, setLine2] = useState(settings.adminPhone2.number);
  const [email, setEmail] = useState(settings.officialEmail);
  const [instagram, setInstagram] = useState(settings.instagram);
  const [facebook, setFacebook] = useState(settings.facebook);
  const [tiktok, setTiktok] = useState(settings.tiktok);

  // Feedback Banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
  const [managingOutfitsCol, setManagingOutfitsCol] = useState<Collection | null>(null);

  // Form State for Create/Edit Collection
  const [formName, setFormName] = useState('');
  const [formSlot, setFormSlot] = useState('Slot 05');
  const [formCategory, setFormCategory] = useState('Luxury Pret');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('/assets/aistudio/images__3__b7c950ec.jpe');

  // Real-time synchronization
  const refreshCollections = () => {
    setCollections(storageService.getCollections(false));
    setProducts(storageService.getProducts(false));
  };

  useEffect(() => {
    const handleCollectionsUpdated = () => refreshCollections();
    const handleProductsUpdated = () => refreshCollections();
    window.addEventListener('saharish_collections_updated', handleCollectionsUpdated);
    window.addEventListener('saharish_products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('saharish_collections_updated', handleCollectionsUpdated);
      window.removeEventListener('saharish_products_updated', handleProductsUpdated);
    };
  }, []);

  const handleUpdateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...settings,
      bannerTitle,
      bannerCtaUrl: bannerUrl,
      bannerButtonLabel: bannerBtn,
    };
    storageService.saveAdminSettings(updated);
    setSettings(updated);
    setBannerToast(true);
    setTimeout(() => setBannerToast(false), 3000);
  };

  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AdminSettings = {
      ...settings,
      adminPhone1: {
        ...settings.adminPhone1,
        number: line1,
      },
      adminPhone2: {
        ...settings.adminPhone2,
        number: line2,
      },
      officialEmail: email,
      instagram,
      facebook,
      tiktok,
    };
    storageService.saveAdminSettings(updated);
    setSettings(updated);
    setContactToast(true);
    setTimeout(() => setContactToast(false), 3000);
  };

  const handleToggleVisibility = (id: string) => {
    const res = storageService.toggleCollectionVisibility(id);
    if (res.success) {
      refreshCollections();
      setFeedback({
        type: 'success',
        text: `Collection visibility set to ${res.visible ? 'Visible' : 'Hidden'}.`,
      });
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleOpenCreateModal = () => {
    setFormName('');
    setFormSlot(`Slot 0${collections.length + 1}`);
    setFormCategory('Luxury Pret');
    setFormTagline('');
    setFormDescription('');
    setFormCoverImage('/assets/aistudio/images__3__b7c950ec.jpe');
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (col: Collection) => {
    setEditingCollection(col);
    setFormName(col.name);
    setFormSlot(col.slot);
    setFormCategory(col.category);
    setFormTagline(col.tagline);
    setFormDescription(col.description);
    setFormCoverImage(col.coverImage);
  };

  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingCollection) {
      const res = storageService.updateCollection(editingCollection.id, {
        name: formName.trim(),
        slot: formSlot,
        category: formCategory,
        tagline: formTagline.trim(),
        description: formDescription.trim(),
        coverImage: formCoverImage,
      });
      if (res.success) {
        setFeedback({ type: 'success', text: `Collection "${formName}" updated successfully!` });
        setEditingCollection(null);
        refreshCollections();
      }
    } else {
      const created = storageService.createCollection({
        name: formName.trim(),
        slot: formSlot,
        category: formCategory,
        tagline: formTagline.trim(),
        description: formDescription.trim(),
        coverImage: formCoverImage,
        visible: true,
      });
      setFeedback({ type: 'success', text: `Collection "${created.name}" created successfully!` });
      setShowCreateModal(false);
      refreshCollections();
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleConfirmDelete = () => {
    if (!collectionToDelete) return;
    const res = storageService.deleteCollectionToTrash(collectionToDelete.id);
    if (res.success) {
      setFeedback({
        type: 'success',
        text: `Collection "${collectionToDelete.name}" moved to Trash. It has been immediately removed from the storefront.`,
      });
      setCollectionToDelete(null);
      refreshCollections();
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // Assign / Unassign product in Managing Outfits Modal
  const handleToggleProductInCollection = (prod: Product, colName: string) => {
    const isAssigned = prod.category === colName;
    const updatedCategory = isAssigned ? 'Unassigned' : colName;
    const allProds = storageService.getProducts(false);
    const target = allProds.find((p) => p.id === prod.id);
    if (target) {
      target.category = updatedCategory;
      storageService.saveProducts(allProds);
      storageService.syncCollectionCounts();
      refreshCollections();
    }
  };

  const filteredCollections = collections.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.tagline.toLowerCase().includes(q)
    );
  });

  const totalActiveCollections = collections.filter((c) => c.visible !== false).length;
  const totalAssignedPieces = products.filter((p) => p.category && p.category !== 'Unassigned').length;

  return (
    <div className="space-y-10 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7A582F]"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
              Storefront Visual Merchandiser
            </span>
            <span className="w-1 h-1 rounded-full bg-[#D4C3B9]"></span>
            <span className="text-[10px] uppercase tracking-wider text-[#82746C]">
              Spring/Summer Capsule 2025
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#42240D] tracking-tight">
            Collections &amp; Storefront Merchandising
          </h1>
          <p className="text-xs text-[#50443D] max-w-2xl mt-1">
            Create, edit, hide, or delete ladies' couture collections, assign lookbook silhouettes, and configure homepage banners for SAHARISH luxury pret boutiques.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onGoToTrash && (
            <button
              type="button"
              onClick={onGoToTrash}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#42240D] border border-[#D4C3B9] text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
            >
              <Trash2 className="w-4 h-4 text-[#BA1A1A]" />
              <span>View Trash</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
          >
            <Plus className="w-4 h-4 text-[#C49A6C]" />
            <span>+ Create New Collection</span>
          </button>
        </div>
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
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
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

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#D4C3B9]/50 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#82746C]">
            Active Collections
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif text-2xl font-bold text-[#42240D]">
              {totalActiveCollections < 10 ? `0${totalActiveCollections}` : totalActiveCollections}
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Live in Boutique
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D4C3B9]/50 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#82746C]">
            Curated Pieces Assigned
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif text-2xl font-bold text-[#42240D]">
              {totalAssignedPieces}
            </span>
            <span className="text-xs text-[#82746C]">Outfits Total</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D4C3B9]/50 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#82746C]">
            Hero Banner Rotation
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif text-2xl font-bold text-[#42240D]">1 / 3</span>
            <span className="text-[10px] font-bold text-[#7A582F] bg-[#FECF9D]/40 px-2 py-0.5 rounded-full">
              Slot 1 Prime
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#D4C3B9]/50 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#82746C]">
            Boutique Inquiries (24h)
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-serif text-2xl font-bold text-[#42240D]">42</span>
            <span className="text-[10px] font-bold text-[#5C3A21]">WhatsApp Sync</span>
          </div>
        </div>
      </div>

      {/* Section 1: Curated Pret & Haute Collections Management */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#42240D]">
              Curated Pret &amp; Haute Collections
            </h2>
            <p className="text-xs text-[#50443D]">
              Manage lookbook hierarchy, assign bespoke ensembles, toggle visibility, and delete unwanted capsules.
            </p>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#82746C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search collections..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
            />
          </div>
        </div>

        {filteredCollections.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-[#D4C3B9]/50 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-[#C49A6C] mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#42240D]">No Collections Found</h3>
            <p className="text-xs text-[#82746C]">
              Create a new collection to showcase silhouettes on the homepage and catalog.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-[#5C3A21] text-white text-xs font-bold uppercase tracking-wider"
            >
              + Create First Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCollections.map((col) => {
              const assignedCount = products.filter((p) => p.category === col.name).length;
              const isVisible = col.visible !== false;

              return (
                <div
                  key={col.id}
                  className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                    isVisible ? 'border-[#D4C3B9]/50' : 'border-dashed border-gray-300 opacity-80'
                  }`}
                >
                  <div>
                    {/* Collection Cover Image */}
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF7F2] mb-3">
                      <img
                        src={col.coverImage}
                        alt={col.name}
                        className={`w-full h-full object-cover ${!isVisible ? 'grayscale' : ''}`}
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/95 text-[9px] uppercase font-bold tracking-wider text-[#42240D] shadow-sm">
                        {col.slot}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(col.id)}
                        className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider shadow-sm transition-colors ${
                          isVisible
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                        title="Click to toggle visibility"
                      >
                        {isVisible ? 'Visible' : 'Hidden'}
                      </button>
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F] block">
                      {col.category} · {assignedCount} Outfits
                    </span>
                    <h3 className="font-serif text-base font-bold text-[#42240D] mt-1">
                      {col.name}
                    </h3>
                    <p className="text-xs text-[#50443D] line-clamp-2 mt-0.5 leading-relaxed">
                      {col.tagline}
                    </p>
                  </div>

                  {/* Individual Management Controls: [Edit] [Hide] [Delete] */}
                  <div className="pt-2 border-t border-[#F0EDE9] space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(col)}
                        className="py-2 px-2.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F0EDE9] text-[#42240D] text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                        title="Edit collection name, images, category, tagline"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#7A582F]" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setManagingOutfitsCol(col)}
                        className="py-2 px-2.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F0EDE9] text-[#42240D] text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                        title="Add or remove individual products from this collection"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#7A582F]" />
                        <span>Outfits ({assignedCount})</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(col.id)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 border transition-colors ${
                          isVisible
                            ? 'bg-white border-[#D4C3B9] text-[#50443D] hover:bg-[#FAF7F2]'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        }`}
                      >
                        {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{isVisible ? 'Hide' : 'Unhide'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCollectionToDelete(col)}
                        className="py-1.5 px-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-[#BA1A1A] text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                        title="Delete entire collection to Trash"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Front-Store Hero Display (Matches code_ce7c0e75.html) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D4C3B9]/50 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7A582F]"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
              Front-Store Hero Display
            </span>
          </div>
          <h2 className="font-serif text-xl font-bold text-[#42240D]">
            Homepage Hero Banner &amp; Promotional Slider
          </h2>
          <p className="text-xs text-[#50443D]">
            Manage high-impact hero banners matching the brand's signature terracotta and rich chocolate aesthetic.
          </p>
        </div>

        <form onSubmit={handleUpdateBanner} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Banner Live Preview (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#42240D] uppercase tracking-wider">
                Active Banner Slot 1 (Primary Desktop Hero)
              </span>
              <span className="text-[#82746C]">Ratio: 2.68:1 (2056 × 765 px)</span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-[#C49A6C]/40 bg-gradient-to-r from-[#42240D] via-[#5C3A21] to-[#311807] p-8 text-white min-h-[220px] flex flex-col justify-between shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#C49A6C]">
                    SAHARISH ESTD 2023
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white mt-1">
                    {bannerTitle}
                  </h3>
                  <p className="text-xs text-[#FAF7F2]/80 mt-1">
                    Style · Quality · Elegance
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold">
                  Live in Boutique
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/20 mt-4 text-[11px]">
                <span className="text-[#C49A6C]">CTA Action: {bannerUrl}</span>
                <span className="px-3 py-1 rounded-lg bg-[#C49A6C] text-[#2F1502] font-bold uppercase tracking-wider">
                  {bannerBtn}
                </span>
              </div>
            </div>
          </div>

          {/* Banner Settings Form (4 cols) */}
          <div className="lg:col-span-4 bg-[#FAF7F2] p-5 rounded-2xl border border-[#D4C3B9]/60 space-y-4">
            <h4 className="font-serif text-base font-bold text-[#42240D]">
              Banner Properties
            </h4>

            <div>
              <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                Banner Title / Identifier
              </label>
              <input
                type="text"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                CTA Action Destination (URL)
              </label>
              <input
                type="text"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                Button Label
              </label>
              <input
                type="text"
                value={bannerBtn}
                onChange={(e) => setBannerBtn(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                required
              />
            </div>

            <div className="pt-2">
              {bannerToast && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mb-2">
                  <CheckCircle2 className="w-4 h-4" /> Hero banner updated!
                </span>
              )}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4 text-[#C49A6C]" />
                <span>Update Banner Slot</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Section 3: Atelier Contact & Social Channels Configuration */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D4C3B9]/50 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4 text-[#7A582F]" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
                Boutique Footprint &amp; Client Desk
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#42240D]">
              Atelier Contact &amp; Social Channels Configuration
            </h2>
            <p className="text-xs text-[#50443D] max-w-2xl mt-1">
              Synchronize global client care lines, VIP WhatsApp styling concierge, and verified social media channels displayed in the boutique footer and live inquiry widgets.
            </p>
          </div>

          <button
            onClick={handleUpdateContact}
            className="px-5 py-2.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 self-start md:self-auto"
          >
            <Save className="w-4 h-4 text-[#C49A6C]" />
            <span>Save Channel Settings</span>
          </button>
        </div>

        {contactToast && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Channel and hotline settings saved!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: WhatsApp Concierge Lines */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4C3B9]/60 space-y-4">
            <div className="flex items-center gap-2 text-[#42240D] font-bold text-xs uppercase tracking-wider">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Concierge Desk</span>
            </div>
            <p className="text-xs text-[#50443D]">
              Direct ordering hotlines for haute bespoke styling &amp; dispatch assistance.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#82746C] mb-1">
                  Primary Stylist Line
                </label>
                <input
                  type="text"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="w-full p-2 bg-white border border-[#D4C3B9] rounded-lg text-xs font-mono font-bold text-[#42240D]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#82746C] mb-1">
                  Secondary Dispatch Line
                </label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="w-full p-2 bg-white border border-[#D4C3B9] rounded-lg text-xs font-mono font-bold text-[#42240D]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Official Communications */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4C3B9]/60 space-y-4">
            <div className="flex items-center gap-2 text-[#42240D] font-bold text-xs uppercase tracking-wider">
              <Mail className="w-4 h-4 text-[#7A582F]" />
              <span>Official Communications</span>
            </div>
            <p className="text-xs text-[#50443D]">
              Inquiries, luxury bespoke orders, and international shipping clearance.
            </p>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#82746C] mb-1">
                Official Atelier Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-white border border-[#D4C3B9] rounded-lg text-xs text-[#42240D]"
              />
            </div>
            <div className="text-[11px] text-[#82746C]">
              Automated autoresponder active for customer inquiries.
            </div>
          </div>

          {/* Card 3: Verified Social Handles */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4C3B9]/60 space-y-4">
            <div className="flex items-center gap-2 text-[#42240D] font-bold text-xs uppercase tracking-wider">
              <Share2 className="w-4 h-4 text-[#7A582F]" />
              <span>Verified Social Channels</span>
            </div>
            <p className="text-xs text-[#50443D]">
              Displayed dynamically in store header, navigation flyout, and checkout receipt.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#82746C] mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full p-1.5 bg-white border border-[#D4C3B9] rounded-lg text-xs text-[#42240D]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#82746C] mb-1">
                  Facebook
                </label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full p-1.5 bg-white border border-[#D4C3B9] rounded-lg text-xs text-[#42240D]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#82746C] mb-1">
                  TikTok
                </label>
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  className="w-full p-1.5 bg-white border border-[#D4C3B9] rounded-lg text-xs text-[#42240D]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Create or Edit Collection Modal */}
      {(showCreateModal || editingCollection) && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 border border-[#C49A6C] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE9]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#5C3A21] text-[#C49A6C] flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#42240D]">
                    {editingCollection ? 'Edit Collection Details' : 'Create New Collection'}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-[#82746C]">
                    Storefront Lookbook &amp; Capsule
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCollection(null);
                }}
                className="text-[#82746C] hover:text-[#42240D] p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                  Collection Title *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Velvet Heritage Soirée"
                  required
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                    Display Slot
                  </label>
                  <input
                    type="text"
                    value={formSlot}
                    onChange={(e) => setFormSlot(e.target.value)}
                    placeholder="e.g. Slot 05"
                    required
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Winter Couture"
                    required
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                  Tagline / Subheading
                </label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="Opulent velvet silhouettes with antique zardozi work."
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                  Editorial Narrative / Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed lookbook editorial description..."
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7A582F] mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={formCoverImage}
                  onChange={(e) => setFormCoverImage(e.target.value)}
                  placeholder="/assets/aistudio/... or https://..."
                  required
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs font-mono"
                />
                <div className="flex gap-2 mt-2">
                  {[
                    '/assets/aistudio/images__3__b7c950ec.jpe',
                    '/assets/aistudio/images__4__513f3e8d.jpe',
                    '/assets/aistudio/images__6__33285667.jpe',
                    '/assets/aistudio/images__7__c2ab6d5a.jpe',
                  ].map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Preset option"
                      onClick={() => setFormCoverImage(img)}
                      className={`w-10 h-14 object-cover rounded-md cursor-pointer border-2 transition-transform ${
                        formCoverImage === img
                          ? 'border-[#5C3A21] scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCollection(null);
                  }}
                  className="py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EDE9] border border-[#D4C3B9] text-xs font-bold uppercase tracking-wider text-[#42240D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-[#C49A6C]" />
                  <span>{editingCollection ? 'Save Changes' : 'Create Collection'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Collection Confirmation Modal */}
      {collectionToDelete && (
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
                  Delete Collection
                </h3>
                <span className="text-[10px] uppercase font-bold text-red-700">
                  Move to Trash &amp; Hide From Store
                </span>
              </div>
            </div>

            <p className="text-xs text-[#50443D] leading-relaxed">
              Are you sure you want to delete the collection{' '}
              <strong>"{collectionToDelete.name}"</strong>? It will immediately disappear from the homepage, header navigation pills, footer links, and customer catalog. You can restore it later from Trash if needed.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCollectionToDelete(null)}
                className="py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EDE9] border border-[#D4C3B9] text-xs font-bold uppercase tracking-wider text-[#42240D]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 rounded-xl bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Manage Outfits / Add or Remove Products Modal */}
      {managingOutfitsCol && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 border border-[#C49A6C] shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE9]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#42240D]">
                  Manage Outfits: {managingOutfitsCol.name}
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-[#82746C]">
                  Check products to assign to this collection, uncheck to remove
                </span>
              </div>
              <button
                type="button"
                onClick={() => setManagingOutfitsCol(null)}
                className="text-[#82746C] hover:text-[#42240D] p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#F0EDE9] pr-1">
              {products.map((prod) => {
                const isAssigned = prod.category === managingOutfitsCol.name;
                return (
                  <div
                    key={prod.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-[#FAF7F2]/40 px-2 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-10 h-14 object-cover rounded-lg border border-[#D4C3B9]"
                      />
                      <div>
                        <div className="font-bold text-xs text-[#42240D]">{prod.title}</div>
                        <div className="text-[10px] font-mono text-[#82746C]">
                          SKU: {prod.sku} · Current: {prod.category}
                        </div>
                        <div className="text-[10px] font-serif font-bold text-[#7A582F]">
                          PKR {prod.price.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleProductInCollection(prod, managingOutfitsCol.name)
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        isAssigned
                          ? 'bg-[#5C3A21] text-white shadow-sm'
                          : 'bg-[#FAF7F2] hover:bg-[#F0EDE9] text-[#50443D] border border-[#D4C3B9]'
                      }`}
                    >
                      {isAssigned ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C49A6C]" />
                          <span>Assigned</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Capsule</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#F0EDE9] flex justify-end">
              <button
                type="button"
                onClick={() => setManagingOutfitsCol(null)}
                className="px-5 py-2.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                Done Managing Outfits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Product, CustomerUser, CartItem, ProductSize, DeliverableType, Order } from './types';
import { storageService } from './services/storageService';
import { Header } from './components/storefront/Header';
import { HeroBanner } from './components/storefront/HeroBanner';
import { CollectionsSection } from './components/storefront/CollectionsSection';
import { ProductGrid } from './components/storefront/ProductGrid';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartDrawer } from './components/storefront/CartDrawer';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { Footer } from './components/storefront/Footer';
import { AuthSection } from './components/auth/AuthSection';
import { AdminLayout } from './components/admin/AdminLayout';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { OTPNotificationBanner } from './components/common/OTPNotificationBanner';
import { adminAuthService, normalizePakistaniPhone } from './services/adminAuthService';
import { AdminLoginModal } from './components/admin/AdminLoginModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'store' | 'auth' | 'admin'>('store');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() =>
    adminAuthService.isAuthenticated()
  );
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [collections, setCollections] = useState(() => storageService.getCollections());
  const [customer, setCustomer] = useState<CustomerUser | null>(() => storageService.getCurrentCustomer());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const raw = localStorage.getItem('saharish_cart_v1');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('saharish_cart_v1', JSON.stringify(cartItems));
  }, [cartItems]);

  // Synchronize products and collections across storefront and admin
  useEffect(() => {
    const handleProductsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ products?: Product[]; deletedId?: string }>;
      if (customEvent.detail?.products) {
        setProducts(customEvent.detail.products);
      } else {
        setProducts(storageService.getProducts());
      }
      setCollections(storageService.getCollections());

      if (customEvent.detail?.deletedId) {
        const deletedId = customEvent.detail.deletedId;
        if (selectedProduct?.id === deletedId) {
          setSelectedProduct(null);
        }
        setCartItems((prev) => prev.filter((it) => it.product.id !== deletedId));
      }
    };

    const handleCollectionsUpdated = () => {
      setCollections(storageService.getCollections());
      setProducts(storageService.getProducts());
    };

    window.addEventListener('saharish_products_updated', handleProductsUpdated);
    window.addEventListener('saharish_collections_updated', handleCollectionsUpdated);
    return () => {
      window.removeEventListener('saharish_products_updated', handleProductsUpdated);
      window.removeEventListener('saharish_collections_updated', handleCollectionsUpdated);
    };
  }, [selectedProduct]);

  const handleProductDeleted = (deletedId: string) => {
    const updated = storageService.getProducts();
    setProducts(updated);
    setCollections(storageService.getCollections());
    if (selectedProduct?.id === deletedId) {
      setSelectedProduct(null);
    }
    setCartItems((prev) => prev.filter((it) => it.product.id !== deletedId));
  };

  // Wishlist toggle
  const handleToggleWishlist = (productId: string) => {
    if (!customer) {
      setCurrentView('auth');
      return;
    }

    const currentList = customer.wishlistIds || [];
    const exists = currentList.includes(productId);
    const updatedList = exists
      ? currentList.filter((id) => id !== productId)
      : [...currentList, productId];

    const updatedCustomer: CustomerUser = {
      ...customer,
      wishlistIds: updatedList,
    };
    storageService.saveCustomer(updatedCustomer);
    storageService.saveCurrentCustomer(updatedCustomer);
    setCustomer(updatedCustomer);
  };

  // Cart actions
  const handleAddToCart = (
    product: Product,
    size: ProductSize = 'M',
    deliverable: DeliverableType = 'stitched'
  ) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (it) =>
          it.product.id === product.id &&
          it.size === size &&
          it.deliverable === deliverable
      );

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        return copy;
      } else {
        return [...prev, { product, size, deliverable, quantity: 1 }];
      }
    });
    setCartOpen(true);
  };

  const handleUpdateQuantity = (
    productId: string,
    size: ProductSize,
    deliverable: DeliverableType,
    delta: number
  ) => {
    setCartItems((prev) => {
      return prev
        .map((it) => {
          if (
            it.product.id === productId &&
            it.size === size &&
            it.deliverable === deliverable
          ) {
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (
    productId: string,
    size: ProductSize,
    deliverable: DeliverableType
  ) => {
    setCartItems((prev) =>
      prev.filter(
        (it) =>
          !(
            it.product.id === productId &&
            it.size === size &&
            it.deliverable === deliverable
          )
      )
    );
  };

  const handleOrderSuccess = (order: Order) => {
    setCartItems([]);
    setCheckoutOpen(false);
  };

  // Instant WhatsApp Order from product card
  const handleInstantWhatsAppOrder = (product: Product) => {
    const settings = storageService.getAdminSettings();
    const phoneDigits = normalizePakistaniPhone(settings.officialWhatsAppNumber || '03097309810').normalizedDigits;
    const text = encodeURIComponent(
      `Salam SAHARISH Concierge, I would like to inquire/order the *${product.title}* (SKU: ${product.sku}) priced at PKR ${product.price.toLocaleString()}. Please assist me with size & dispatch availability.`
    );
    window.open(`https://wa.me/${phoneDigits}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleNavigate = (view: 'store' | 'auth' | 'admin') => {
    if (view === 'admin' && !adminAuthService.isAuthenticated()) {
      setShowAdminLoginModal(true);
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FCF9F4] text-[#1C1C19] flex flex-col font-sans selection:bg-[#F7E7E0] selection:text-[#42240D]">
      {/* Real-time Simulated Incoming OTP & Admin Notification Toast (Strictly Encrypted Direct Delivery) */}
      <OTPNotificationBanner />

      {/* Admin Atelier View or Storefront */}
      {currentView === 'admin' ? (
        isAdminAuthenticated ? (
          <AdminLayout
            onExitAdmin={() => setCurrentView('store')}
            onLogout={() => {
              adminAuthService.logout();
              setIsAdminAuthenticated(false);
              setCurrentView('store');
            }}
            onProductDeleted={handleProductDeleted}
          />
        ) : (
          <AdminLoginModal
            isOpen={true}
            onLoginSuccess={() => {
              setIsAdminAuthenticated(true);
              setShowAdminLoginModal(false);
            }}
            onClose={() => setCurrentView('store')}
          />
        )
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Main Boutique Header */}
          <Header
            currentView={currentView}
            onNavigate={handleNavigate}
            customer={customer}
            cartItems={cartItems}
            wishlistCount={customer?.wishlistIds?.length || 0}
            onOpenCart={() => setCartOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              const catalogElement = document.getElementById('catalog-section');
              if (catalogElement) {
                catalogElement.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />

          {/* Body Content based on View */}
          {currentView === 'store' && (
            <main className="flex-1">
              {/* Luxury Hero Banner with 4 Trust Pillars */}
              <HeroBanner
                onShopNow={() => {
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenConcierge={() => {
                  const settings = storageService.getAdminSettings();
                  const phoneDigits = normalizePakistaniPhone(settings.officialWhatsAppNumber || '03097309810').normalizedDigits;
                  window.open(
                    `https://wa.me/${phoneDigits}?text=Salam%20SAHARISH%20Atelier,%20I%20would%20like%20to%20consult%20with%20a%20personal%20stylist.`,
                    '_blank',
                    'noopener,noreferrer'
                  );
                }}
              />

              {/* Curated Capsules Showcase */}
              <CollectionsSection
                collections={collections}
                products={products}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              {/* Product Catalog Grid */}
              <ProductGrid
                products={products}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                wishlistIds={customer?.wishlistIds || []}
                onToggleWishlist={handleToggleWishlist}
                onSelectProduct={setSelectedProduct}
                onAddToCart={(p) => handleAddToCart(p, 'M', 'stitched')}
                onInstantWhatsAppOrder={handleInstantWhatsAppOrder}
              />
            </main>
          )}

          {currentView === 'auth' && (
            <main className="flex-1">
              <AuthSection
                initialCustomer={customer}
                onCustomerChange={(newCust) => setCustomer(newCust)}
                onSelectProduct={setSelectedProduct}
                onAddToCart={(p) => handleAddToCart(p, 'M', 'stitched')}
              />
            </main>
          )}

          {/* Boutique Footer */}
          <Footer
            onNavigate={handleNavigate}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentView('store');
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Floating WhatsApp Concierge Button on every page */}
          <WhatsAppFloatingButton currentProductTitle={selectedProduct?.title} />
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          isWishlisted={Boolean(customer?.wishlistIds?.includes(selectedProduct.id))}
          onToggleWishlist={() => handleToggleWishlist(selectedProduct.id)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal
          items={cartItems}
          customer={customer}
          onClose={() => setCheckoutOpen(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* Global Admin Login & Password Recovery Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onLoginSuccess={() => {
          setIsAdminAuthenticated(true);
          setShowAdminLoginModal(false);
          setCurrentView('admin');
        }}
        onClose={() => setShowAdminLoginModal(false)}
      />
    </div>
  );
}

import {
  Product,
  Collection,
  CustomerUser,
  Order,
  AdminSettings,
  AdminNotificationLog,
  OTPRecord,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_COLLECTIONS,
  INITIAL_CUSTOMER,
  INITIAL_ORDERS,
  INITIAL_ADMIN_SETTINGS,
  INITIAL_NOTIFICATION_LOGS,
} from '../data/mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'saharish_products_v1',
  TRASH_PRODUCTS: 'saharish_trash_products_v1',
  PURGED_PRODUCT_IDS: 'saharish_purged_product_ids_v1',

  COLLECTIONS: 'saharish_collections_v1',
  TRASH_COLLECTIONS: 'saharish_trash_collections_v1',
  PURGED_COLLECTION_IDS: 'saharish_purged_collection_ids_v1',

  CUSTOMER: 'saharish_current_customer_v1',
  ALL_CUSTOMERS: 'saharish_all_customers_v1',
  ORDERS: 'saharish_orders_v1',
  ADMIN_SETTINGS: 'saharish_admin_settings_v1',
  NOTIFICATION_LOGS: 'saharish_notification_logs_v1',
  OTP_RECORDS: 'saharish_otp_records_v1',
  CART: 'saharish_cart_v1',
};

export const storageService = {
  // ==========================================
  // PURGED IDS HELPERS (NEVER RESURRECT DELETED)
  // ==========================================
  getPurgedProductIds(): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PURGED_PRODUCT_IDS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  getPurgedCollectionIds(): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PURGED_COLLECTION_IDS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  // ==========================================
  // PRODUCTS MANAGEMENT & TRASH SYSTEM
  // ==========================================
  getProducts(includeDeleted: boolean = false): Product[] {
    const purgedIds = this.getPurgedProductIds();
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    let list: Product[] = [];

    if (!raw) {
      list = INITIAL_PRODUCTS.filter((p) => !purgedIds.includes(p.id));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = INITIAL_PRODUCTS.filter((p) => !purgedIds.includes(p.id));
      }
    }

    list = list.filter((p) => !purgedIds.includes(p.id));

    if (!includeDeleted) {
      return list.filter((p) => !p.isDeleted);
    }
    return list;
  },

  getTrashProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRASH_PRODUCTS);
    if (!raw) return [];
    try {
      const list: Product[] = JSON.parse(raw);
      const purged = this.getPurgedProductIds();
      return list.filter((p) => !purged.includes(p.id));
    } catch {
      return [];
    }
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('saharish_products_updated', {
          detail: { products },
        })
      );
    }
  },

  deleteProduct(id: string): { success: boolean; message: string; deletedProduct?: Product } {
    return this.deleteProductToTrash(id);
  },

  deleteProductToTrash(id: string): { success: boolean; message: string; deletedProduct?: Product } {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return { success: false, message: 'Invalid product identifier provided.' };
    }

    const currentProducts = this.getProducts(false);
    const targetIndex = currentProducts.findIndex((p) => p.id === id);
    if (targetIndex === -1) {
      return { success: false, message: 'Product could not be found or has already been moved to Trash.' };
    }

    const [deletedProduct] = currentProducts.splice(targetIndex, 1);
    const trashedItem: Product = {
      ...deletedProduct,
      visible: false,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    };

    this.saveProducts(currentProducts);

    // Save to Trash storage
    const trash = this.getTrashProducts();
    const existingIdx = trash.findIndex((p) => p.id === id);
    if (existingIdx >= 0) {
      trash[existingIdx] = trashedItem;
    } else {
      trash.unshift(trashedItem);
    }
    localStorage.setItem(STORAGE_KEYS.TRASH_PRODUCTS, JSON.stringify(trash));

    // Clean up cart and wishlists
    this.cleanupCartForProduct(id);
    this.cleanupWishlistsForProduct(id);

    // Synchronize collection counts
    this.syncCollectionCounts();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('saharish_products_updated', {
          detail: { products: currentProducts, deletedId: id },
        })
      );
    }

    return {
      success: true,
      message: 'Product moved to Trash successfully!',
      deletedProduct: trashedItem,
    };
  },

  restoreProduct(id: string): { success: boolean; message: string; restoredProduct?: Product } {
    const trash = this.getTrashProducts();
    const targetIndex = trash.findIndex((p) => p.id === id);
    if (targetIndex === -1) {
      return { success: false, message: 'Product not found in Trash.' };
    }

    const [restoredProduct] = trash.splice(targetIndex, 1);
    restoredProduct.isDeleted = false;
    restoredProduct.visible = true;
    delete restoredProduct.deletedAt;

    localStorage.setItem(STORAGE_KEYS.TRASH_PRODUCTS, JSON.stringify(trash));

    const active = this.getProducts(false);
    active.unshift(restoredProduct);
    this.saveProducts(active);

    this.syncCollectionCounts();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('saharish_products_updated', {
          detail: { products: active, restoredId: id },
        })
      );
    }

    return {
      success: true,
      message: `Product "${restoredProduct.title}" restored successfully to active boutique!`,
      restoredProduct,
    };
  },

  permanentlyDeleteProduct(id: string): { success: boolean; message: string } {
    // Remove from trash
    const trash = this.getTrashProducts().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRASH_PRODUCTS, JSON.stringify(trash));

    // Remove from active
    const active = this.getProducts(false).filter((p) => p.id !== id);
    this.saveProducts(active);

    // Record in purged IDs so initial mock never resurrects it
    const purged = this.getPurgedProductIds();
    if (!purged.includes(id)) {
      purged.push(id);
      localStorage.setItem(STORAGE_KEYS.PURGED_PRODUCT_IDS, JSON.stringify(purged));
    }

    this.cleanupCartForProduct(id);
    this.cleanupWishlistsForProduct(id);
    this.syncCollectionCounts();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('saharish_products_updated', {
          detail: { products: active, permanentlyDeletedId: id },
        })
      );
    }

    return {
      success: true,
      message: 'Product permanently purged from database.',
    };
  },

  toggleProductVisibility(id: string): { success: boolean; visible: boolean } {
    const active = this.getProducts(false);
    const target = active.find((p) => p.id === id);
    if (!target) return { success: false, visible: false };

    target.visible = target.visible === false ? true : false;
    this.saveProducts(active);

    return { success: true, visible: target.visible };
  },

  cleanupCartForProduct(productId: string): void {
    try {
      const rawCart = localStorage.getItem(STORAGE_KEYS.CART);
      if (rawCart) {
        const cart = JSON.parse(rawCart);
        if (Array.isArray(cart)) {
          const updatedCart = cart.filter((item: any) => item?.product?.id !== productId);
          localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(updatedCart));
        }
      }
    } catch (e) {
      console.error('Error cleaning cart for product:', e);
    }
  },

  cleanupWishlistsForProduct(productId: string): void {
    try {
      const allCustomers = this.getAllCustomers();
      let customersChanged = false;
      allCustomers.forEach((cust) => {
        if (Array.isArray(cust.wishlistIds) && cust.wishlistIds.includes(productId)) {
          cust.wishlistIds = cust.wishlistIds.filter((wId) => wId !== productId);
          customersChanged = true;
        }
      });
      if (customersChanged) {
        localStorage.setItem(STORAGE_KEYS.ALL_CUSTOMERS, JSON.stringify(allCustomers));
        const currentCust = this.getCurrentCustomer();
        if (currentCust && Array.isArray(currentCust.wishlistIds) && currentCust.wishlistIds.includes(productId)) {
          currentCust.wishlistIds = currentCust.wishlistIds.filter((wId) => wId !== productId);
          this.saveCurrentCustomer(currentCust);
        }
      }
    } catch (e) {
      console.error('Error cleaning wishlists for product:', e);
    }
  },

  // ==========================================
  // COLLECTIONS MANAGEMENT & TRASH SYSTEM
  // ==========================================
  getCollections(includeDeleted: boolean = false): Collection[] {
    const purgedIds = this.getPurgedCollectionIds();
    const raw = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    let list: Collection[] = [];

    if (!raw) {
      list = INITIAL_COLLECTIONS.filter((c) => !purgedIds.includes(c.id));
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(list));
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = INITIAL_COLLECTIONS.filter((c) => !purgedIds.includes(c.id));
      }
    }

    list = list.filter((c) => !purgedIds.includes(c.id));

    // Specifically ensure legacy unwanted placeholders ('CURATED', 'PRET', 'HAUTE COLLECTION') never resurrect
    const unwantedNames = ['curated', 'pret', 'haute collection'];
    list = list.filter((c) => {
      const nameLower = c.name.trim().toLowerCase();
      return !unwantedNames.includes(nameLower);
    });

    if (!includeDeleted) {
      return list.filter((c) => !c.isDeleted);
    }
    return list;
  },

  getTrashCollections(): Collection[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRASH_COLLECTIONS);
    if (!raw) return [];
    try {
      const list: Collection[] = JSON.parse(raw);
      const purged = this.getPurgedCollectionIds();
      return list.filter((c) => !purged.includes(c.id));
    } catch {
      return [];
    }
  },

  saveCollections(collections: Collection[]): void {
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('saharish_collections_updated', {
          detail: { collections },
        })
      );
    }
  },

  createCollection(data: Omit<Collection, 'id' | 'outfitCount'>): Collection {
    const active = this.getCollections(false);
    const newCol: Collection = {
      ...data,
      id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      outfitCount: 0,
      visible: data.visible ?? true,
      isDeleted: false,
    };

    active.push(newCol);
    this.saveCollections(active);
    this.syncCollectionCounts();
    return newCol;
  },

  updateCollection(id: string, updates: Partial<Collection>): { success: boolean; collection?: Collection } {
    const active = this.getCollections(false);
    const target = active.find((c) => c.id === id);
    if (!target) return { success: false };

    Object.assign(target, updates);
    this.saveCollections(active);
    this.syncCollectionCounts();
    return { success: true, collection: target };
  },

  deleteCollectionToTrash(id: string): { success: boolean; message: string; deletedCollection?: Collection } {
    const active = this.getCollections(false);
    const targetIndex = active.findIndex((c) => c.id === id);
    if (targetIndex === -1) {
      return { success: false, message: 'Collection not found or already moved to Trash.' };
    }

    const [deletedCollection] = active.splice(targetIndex, 1);
    const trashedItem: Collection = {
      ...deletedCollection,
      visible: false,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    };

    this.saveCollections(active);

    const trash = this.getTrashCollections();
    const existingIdx = trash.findIndex((c) => c.id === id);
    if (existingIdx >= 0) {
      trash[existingIdx] = trashedItem;
    } else {
      trash.unshift(trashedItem);
    }
    localStorage.setItem(STORAGE_KEYS.TRASH_COLLECTIONS, JSON.stringify(trash));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('saharish_collections_updated', {
          detail: { collections: active, deletedId: id },
        })
      );
    }

    return {
      success: true,
      message: `Collection "${deletedCollection.name}" moved to Trash.`,
      deletedCollection: trashedItem,
    };
  },

  restoreCollection(id: string): { success: boolean; message: string; restoredCollection?: Collection } {
    const trash = this.getTrashCollections();
    const targetIndex = trash.findIndex((c) => c.id === id);
    if (targetIndex === -1) {
      return { success: false, message: 'Collection not found in Trash.' };
    }

    const [restoredCollection] = trash.splice(targetIndex, 1);
    restoredCollection.isDeleted = false;
    restoredCollection.visible = true;
    delete restoredCollection.deletedAt;

    localStorage.setItem(STORAGE_KEYS.TRASH_COLLECTIONS, JSON.stringify(trash));

    const active = this.getCollections(false);
    active.push(restoredCollection);
    this.saveCollections(active);
    this.syncCollectionCounts();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('saharish_collections_updated', {
          detail: { collections: active, restoredId: id },
        })
      );
    }

    return {
      success: true,
      message: `Collection "${restoredCollection.name}" restored successfully.`,
      restoredCollection,
    };
  },

  permanentlyDeleteCollection(id: string): { success: boolean; message: string } {
    const trash = this.getTrashCollections().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRASH_COLLECTIONS, JSON.stringify(trash));

    const active = this.getCollections(false).filter((c) => c.id !== id);
    this.saveCollections(active);

    const purged = this.getPurgedCollectionIds();
    if (!purged.includes(id)) {
      purged.push(id);
      localStorage.setItem(STORAGE_KEYS.PURGED_COLLECTION_IDS, JSON.stringify(purged));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('saharish_collections_updated', {
          detail: { collections: active, permanentlyDeletedId: id },
        })
      );
    }

    return {
      success: true,
      message: 'Collection permanently removed from database.',
    };
  },

  toggleCollectionVisibility(id: string): { success: boolean; visible: boolean } {
    const active = this.getCollections(false);
    const target = active.find((c) => c.id === id);
    if (!target) return { success: false, visible: false };

    target.visible = !target.visible;
    this.saveCollections(active);

    return { success: true, visible: target.visible };
  },

  syncCollectionCounts(): void {
    try {
      const activeCollections = this.getCollections(false);
      const activeProducts = this.getProducts(false);
      let changed = false;

      activeCollections.forEach((col) => {
        const count = activeProducts.filter((p) => p.category === col.name && p.visible !== false).length;
        if (col.outfitCount !== count) {
          col.outfitCount = count;
          changed = true;
        }
      });

      if (changed) {
        this.saveCollections(activeCollections);
      }
    } catch (e) {
      console.error('Error syncing collection counts:', e);
    }
  },

  // ==========================================
  // CUSTOMER, ORDERS, & SETTINGS
  // ==========================================
  getCurrentCustomer(): CustomerUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(INITIAL_CUSTOMER));
      return INITIAL_CUSTOMER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  saveCurrentCustomer(customer: CustomerUser | null): void {
    if (!customer) {
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
    } else {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(customer));
    }
  },

  getAllCustomers(): CustomerUser[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_CUSTOMERS);
    if (!raw) {
      const initial = [INITIAL_CUSTOMER];
      localStorage.setItem(STORAGE_KEYS.ALL_CUSTOMERS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [INITIAL_CUSTOMER];
    }
  },

  saveCustomer(customer: CustomerUser): void {
    const all = this.getAllCustomers();
    const index = all.findIndex((c) => c.id === customer.id || c.email === customer.email);
    if (index >= 0) {
      all[index] = customer;
    } else {
      all.unshift(customer);
    }
    localStorage.setItem(STORAGE_KEYS.ALL_CUSTOMERS, JSON.stringify(all));
  },

  getOrders(): Order[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ORDERS;
    }
  },

  saveOrder(order: Order): void {
    const orders = this.getOrders();
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  updateOrderStatus(orderId: string, status: Order['orderStatus']): void {
    const orders = this.getOrders();
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      target.orderStatus = status;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  getAdminSettings(): AdminSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(INITIAL_ADMIN_SETTINGS));
      return INITIAL_ADMIN_SETTINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ADMIN_SETTINGS;
    }
  },

  saveAdminSettings(settings: AdminSettings): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
  },

  getNotificationLogs(): AdminNotificationLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_LOGS, JSON.stringify(INITIAL_NOTIFICATION_LOGS));
      return INITIAL_NOTIFICATION_LOGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_NOTIFICATION_LOGS;
    }
  },

  addNotificationLog(log: AdminNotificationLog): void {
    const logs = this.getNotificationLogs();
    logs.unshift(log);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_LOGS, JSON.stringify(logs.slice(0, 50)));
  },

  getOTPRecords(): OTPRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OTP_RECORDS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveOTPRecord(record: OTPRecord): void {
    const records = this.getOTPRecords();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEYS.OTP_RECORDS, JSON.stringify(records.slice(0, 40)));
  },

  updateOTPRecord(id: string, updates: Partial<OTPRecord>): void {
    const records = this.getOTPRecords();
    const item = records.find((r) => r.id === id);
    if (item) {
      Object.assign(item, updates);
      localStorage.setItem(STORAGE_KEYS.OTP_RECORDS, JSON.stringify(records));
    }
  },
};

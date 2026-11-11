export type DeliverableType = 'stitched' | 'unstitched';

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface SizeStock {
  size: ProductSize;
  label: string;
  stock: number;
  priceOffset: number;
  barcode: string;
}

export interface Product {
  id: string;
  title: string;
  sku: string;
  category: string;
  fabric: string;
  price: number;
  compareAtPrice: number;
  costPrice: number;
  images: string[];
  description: {
    shirt: string;
    dupatta: string;
    trouser: string;
    care: string;
  };
  sizeStocks: Record<ProductSize, SizeStock>;
  deliverables: {
    stitched: boolean;
    unstitched: boolean;
  };
  tags: string[];
  instantWhatsAppOrder: boolean;
  status: 'IN STOCK' | 'LOW STOCK' | 'ARCHIVED';
  featured?: boolean;
  visible?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface Collection {
  id: string;
  slot: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  coverImage: string;
  outfitCount: number;
  visible: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface WhatsAppProviderSettings {
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  templateName: string;
  isEnabled: boolean;
  testRecipientNumber: string;
}

export interface CustomerAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItem {
  productId: string;
  title: string;
  sku: string;
  image: string;
  size: ProductSize;
  deliverable: DeliverableType;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: CustomerAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash on Delivery (COD)' | 'Direct Bank Transfer' | 'Credit / Debit Card';
  paymentStatus: 'Pending' | 'Paid';
  orderStatus: 'Pending Review' | 'Processing / Tailoring' | 'Dispatched / In Transit' | 'Delivered' | 'Cancelled';
  courier: string;
  trackingNumber: string;
  notes?: string;
}

export interface CustomerUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isVerified: boolean;
  verifiedVia: 'whatsapp' | 'sms' | null;
  vipMember: boolean;
  loyaltyPoints: number;
  registeredAt: string;
  addresses: CustomerAddress[];
  wishlistIds: string[];
  measurements?: {
    bust: string;
    waist: string;
    hips: string;
    shirtLength: string;
    sleeves: string;
    notes: string;
  };
}

export interface OTPRecord {
  id: string;
  phone: string;
  channel: 'whatsapp' | 'sms';
  code: string;
  purpose: 'registration' | 'login' | 'reset_password';
  createdAt: number;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}

export interface AdminPhoneSettings {
  number: string;
  label: string;
  whatsAppEnabled: boolean;
  smsEnabled: boolean;
}

export interface AdminSettings {
  adminPhone1: AdminPhoneSettings;
  adminPhone2: AdminPhoneSettings;
  notifyOnRegistration: boolean;
  notifyOnOrder: boolean;
  notifyOnAccountActivity: boolean;
  officialWhatsAppNumber: string;
  officialEmail: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  bannerTitle: string;
  bannerCtaUrl: string;
  bannerButtonLabel: string;
  bannerStatus: string;
}

export interface AdminNotificationLog {
  id: string;
  timestamp: string;
  recipient: string;
  channel: 'WhatsApp' | 'SMS';
  event: 'New Customer Registration' | 'New Boutique Order' | 'Security Alert / Password Reset';
  message: string;
  status: 'Delivered';
}

export interface CartItem {
  product: Product;
  size: ProductSize;
  deliverable: DeliverableType;
  quantity: number;
}

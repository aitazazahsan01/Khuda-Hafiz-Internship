export type OfferStatus = 'active' | 'warning' | 'urgent' | 'expired';

export interface ProductSource {
  id: string;
  name: string;
  url: string;
  price: number;
  isOffer?: boolean;
  // Extended properties for the app
  sourceName: string;
  startDate: string;
  endDate: string;
  alertsEnabled: boolean;
}

export interface Product {
  id: string;
  productName: string;
  categoryId?: string;
  categoryName?: string;
  sources: ProductSource[];
  channelStatus: 'not_uploaded' | 'tiktok' | 'amazon' | 'ebay';
  notes?: string;
  createdBy: string;
  creatorName?: string;
  isArchived?: boolean;
  archivedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalculatorSettings {
  id: string;
  platformCommission: number;
  vatRate: number;
  shippingThreshold: number;
  shippingFee: number;
  fullShippingCost: number;
  creatorCommission: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'administrator' | 'user';
  createdAt: string;
  updatedAt: string;
}

export type Language = 'ckb' | 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';
export type Currency = 'USD' | 'IQD' | 'EUR';

export type ProductCategory = 'all' | 'skincare' | 'makeup' | 'haircare' | 'fragrance';
export type SkinType = 'all' | 'dry' | 'oily' | 'sensitive' | 'combination';

export interface LocalizedString {
  ckb: string;
  ar: string;
  en: string;
}

export interface ProductShade {
  id: string;
  name: LocalizedString;
  hex: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string | LocalizedString;
  date: string;
  city?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: LocalizedString;
  subtitle: LocalizedString;
  category: ProductCategory;
  brand: string;
  price: number; // in USD
  originalPrice?: number;
  volume: string;
  rating: number;
  reviewsCount: number;
  image: string;
  additionalImages?: string[];
  inStock: boolean;
  stockCount: number;
  isBestSeller?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  isCollection?: boolean;
  collectionItems?: {
    name: LocalizedString;
    volume: string;
  }[];
  skinType: SkinType[];
  shades?: ProductShade[];
  description: LocalizedString;
  howToUse: LocalizedString;
  ingredients: LocalizedString;
  safetyNotes: LocalizedString;
  reviews: Review[];
}

export interface CartItem {
  product: Product;
  selectedShade?: ProductShade;
  quantity: number;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  address: string;
  notes: string;
  paymentMethod: 'cod' | 'fib' | 'fastpay' | 'card';
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  customer: CheckoutFormData;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: Currency;
  estimatedDelivery: string;
}

export interface FilterState {
  category: ProductCategory;
  minPrice: number;
  maxPrice: number;
  brand: string;
  skinType: SkinType;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  searchQuery: string;
}

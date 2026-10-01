import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';

const PRODUCTS_COLLECTION = 'custom_products';
const SETTINGS_COLLECTION = 'store_settings';
const DELETED_PRODUCTS_DOC = 'deleted_products';

const LOCAL_PRODUCTS_KEY = 'glowistic_custom_products_v1';
const LOCAL_DELETED_KEY = 'glowistic_deleted_products_v1';

// In-memory cache for fast, synchronous initial hydration
let cachedCustomProducts: Product[] = [];
let cachedDeletedIds: string[] = [];

// Try loading from localStorage immediately
try {
  const localProd = localStorage.getItem(LOCAL_PRODUCTS_KEY);
  if (localProd) cachedCustomProducts = JSON.parse(localProd);
  const localDel = localStorage.getItem(LOCAL_DELETED_KEY);
  if (localDel) cachedDeletedIds = JSON.parse(localDel);
} catch {
  // ignore
}

/**
 * Remove undefined values and unsupported types before saving to Firestore.
 * Firestore throws a fatal error if any field is `undefined`.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean as T;
}

/**
 * Merge base hardcoded products with user added/edited products and filter deleted ones.
 * NEW PRODUCTS ADDED BY ADMIN WILL ALWAYS BE AT THE VERY BEGINNING (TOP).
 */
export function mergeProducts(
  baseList: Product[],
  customList: Product[],
  deletedIds: string[]
): Product[] {
  const deletedSet = new Set(deletedIds);
  const customMap = new Map(customList.map((p) => [p.id, p]));
  const baseIdSet = new Set(baseList.map((b) => b.id));

  // 1. Newly created products that didn't exist in baseList
  // These MUST be at the top of the store so the admin & customers see them immediately!
  const newlyCreatedProducts: Product[] = [];
  for (const [id, customProd] of customMap.entries()) {
    if (!baseIdSet.has(id) && !deletedSet.has(id)) {
      newlyCreatedProducts.push(customProd);
    }
  }

  // 2. Base products (customized or default)
  const baseOrUpdatedProducts: Product[] = [];
  for (const base of baseList) {
    if (deletedSet.has(base.id)) {
      continue;
    }
    // If customized in DB, use customized version
    if (customMap.has(base.id)) {
      baseOrUpdatedProducts.push(customMap.get(base.id)!);
    } else {
      baseOrUpdatedProducts.push(base);
    }
  }

  // Put newly created products FIRST, followed by updated base products
  const combined = [...newlyCreatedProducts, ...baseOrUpdatedProducts];

  // Guarantee all products have English names across all locales as requested
  return combined.map((p) => {
    const englishName = p.name?.en || p.name?.ckb || p.name?.ar || '';
    if (!englishName) return p;
    return {
      ...p,
      name: {
        en: englishName,
        ckb: englishName,
        ar: englishName,
      },
    };
  });
}

export function getCachedMergedProducts(): Product[] {
  return mergeProducts(INITIAL_PRODUCTS, cachedCustomProducts, cachedDeletedIds);
}

// Active global subscribers
type ProductSubscriber = (merged: Product[], customList: Product[], deletedIds: string[]) => void;
const subscribers = new Set<ProductSubscriber>();

function broadcastUpdate() {
  const merged = mergeProducts(INITIAL_PRODUCTS, cachedCustomProducts, cachedDeletedIds);
  for (const sub of subscribers) {
    try {
      sub(merged, [...cachedCustomProducts], [...cachedDeletedIds]);
    } catch (err) {
      console.error('Subscriber callback error:', err);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('glowistic_products_updated', {
        detail: { merged, customList: cachedCustomProducts, deletedIds: cachedDeletedIds },
      })
    );
  }
}

// Firestore real-time listener state
let isFirestoreListenerStarted = false;
let unsubFirestoreCustom: (() => void) | null = null;
let unsubFirestoreDeleted: (() => void) | null = null;

function ensureFirestoreListenerStarted() {
  if (isFirestoreListenerStarted) return;
  isFirestoreListenerStarted = true;

  try {
    const customColRef = collection(db, PRODUCTS_COLLECTION);
    unsubFirestoreCustom = onSnapshot(
      customColRef,
      (snapshot) => {
        const fetched: Product[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push(docSnap.data() as Product);
        });
        cachedCustomProducts = fetched;
        try {
          localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(fetched));
        } catch {}
        broadcastUpdate();
      },
      (error) => {
        console.warn('Firestore custom products snapshot error (fallback to local):', error);
      }
    );

    const deletedDocRef = doc(db, SETTINGS_COLLECTION, DELETED_PRODUCTS_DOC);
    unsubFirestoreDeleted = onSnapshot(
      deletedDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const ids = Array.isArray(data.ids) ? data.ids : [];
          cachedDeletedIds = ids;
          try {
            localStorage.setItem(LOCAL_DELETED_KEY, JSON.stringify(ids));
          } catch {}
          broadcastUpdate();
        }
      },
      (error) => {
        console.warn('Firestore deleted products snapshot error (fallback to local):', error);
      }
    );
  } catch (err) {
    console.warn('Firebase setup connection error:', err);
  }
}

/**
 * Subscribes to real-time changes in Firestore and local modifications.
 * Calls onUpdate immediately with cached data, and whenever products are added, edited, or deleted.
 */
export function subscribeToLiveProducts(
  onUpdate: (products: Product[], customList: Product[], deletedIds: string[]) => void
): () => void {
  // Ensure background Firestore listener is active
  ensureFirestoreListenerStarted();

  // Register listener
  subscribers.add(onUpdate);

  // Initial immediate call with cache
  const merged = mergeProducts(INITIAL_PRODUCTS, cachedCustomProducts, cachedDeletedIds);
  onUpdate(merged, [...cachedCustomProducts], [...cachedDeletedIds]);

  return () => {
    subscribers.delete(onUpdate);
  };
}

/**
 * Save or update a product (both in Firestore and localStorage).
 * Triggers instant local UI update without waiting for network latency.
 */
export async function saveProductToStore(product: Product): Promise<void> {
  // 1. Update in-memory cache immediately
  const idx = cachedCustomProducts.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    cachedCustomProducts[idx] = product;
  } else {
    // Prepend newly added product to the front so it appears first!
    cachedCustomProducts = [product, ...cachedCustomProducts];
  }

  // Remove from deleted list if it was previously marked as deleted
  if (cachedDeletedIds.includes(product.id)) {
    cachedDeletedIds = cachedDeletedIds.filter((id) => id !== product.id);
  }

  // 2. Persist to localStorage immediately
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(cachedCustomProducts));
    localStorage.setItem(LOCAL_DELETED_KEY, JSON.stringify(cachedDeletedIds));
  } catch (err) {
    console.warn('Failed to write to localStorage:', err);
  }

  // 3. BROADCAST TO ALL REACT COMPONENTS INSTANTLY!
  broadcastUpdate();

  // 4. Sync to Firestore in the background with sanitization
  try {
    const sanitized = sanitizeForFirestore({
      ...product,
      updatedAt: new Date().toISOString(),
    });

    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(docRef, sanitized);

    // Also ensure it's removed from remote deleted list
    const delDocRef = doc(db, SETTINGS_COLLECTION, DELETED_PRODUCTS_DOC);
    await setDoc(
      delDocRef,
      {
        ids: cachedDeletedIds,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to sync saved product to Firestore:', err);
    // Even if Firestore fails (offline/quota), local state & broadcast already succeeded!
  }
}

/**
 * Delete a product (by marking it deleted or removing from custom_products).
 */
export async function deleteProductFromStore(productId: string): Promise<void> {
  if (!cachedDeletedIds.includes(productId)) {
    cachedDeletedIds.push(productId);
  }
  cachedCustomProducts = cachedCustomProducts.filter((p) => p.id !== productId);

  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(cachedCustomProducts));
    localStorage.setItem(LOCAL_DELETED_KEY, JSON.stringify(cachedDeletedIds));
  } catch (err) {
    console.warn('Failed to write to localStorage:', err);
  }

  // Broadcast change immediately
  broadcastUpdate();

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);

    const delDocRef = doc(db, SETTINGS_COLLECTION, DELETED_PRODUCTS_DOC);
    await setDoc(
      delDocRef,
      {
        ids: cachedDeletedIds,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to sync deletion to Firestore:', err);
  }
}

/**
 * Reset a product back to factory default (if it was an initial product).
 */
export async function resetProductToDefault(productId: string): Promise<void> {
  cachedCustomProducts = cachedCustomProducts.filter((p) => p.id !== productId);
  cachedDeletedIds = cachedDeletedIds.filter((id) => id !== productId);

  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(cachedCustomProducts));
    localStorage.setItem(LOCAL_DELETED_KEY, JSON.stringify(cachedDeletedIds));
  } catch {}

  // Broadcast change immediately
  broadcastUpdate();

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);

    const delDocRef = doc(db, SETTINGS_COLLECTION, DELETED_PRODUCTS_DOC);
    await setDoc(
      delDocRef,
      {
        ids: cachedDeletedIds,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to reset product in Firestore:', err);
  }
}

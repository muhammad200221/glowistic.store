import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface VipMember {
  contact: string;
  normalizedContact: string;
  code: string;
  type: 'email' | 'phone';
  date: string;
}

export type VipRegistrationStatus = 'new' | 'already_registered_contact' | 'already_claimed_device';

const STORAGE_KEY = 'glowistic_vip_waitlist';
const DEVICE_CLAIM_KEY = 'glowistic_device_vip_claim';
const FIRESTORE_COLLECTION = 'vip_members';

/**
 * Normalizes phone numbers & emails to prevent circumventing with spaces, country codes, or casings.
 */
export function normalizeContact(input: string): { normalized: string; type: 'email' | 'phone' } {
  const trimmed = input.trim();
  if (trimmed.includes('@')) {
    return {
      normalized: trimmed.toLowerCase().replace(/\s+/g, ''),
      type: 'email',
    };
  }

  // Phone normalization (specifically handling Iraq/Kurdistan formats)
  let digits = trimmed.replace(/[^\d+]/g, '');
  if (digits.startsWith('+964')) {
    digits = '0' + digits.slice(4);
  } else if (digits.startsWith('00964')) {
    digits = '0' + digits.slice(5);
  } else if (digits.startsWith('964') && digits.length >= 12) {
    digits = '0' + digits.slice(3);
  } else if (digits.startsWith('7') && digits.length === 10) {
    digits = '0' + digits;
  }

  return {
    normalized: digits,
    type: 'phone',
  };
}

export function getLocalVipMembers(): VipMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalVipMembers(members: VipMember[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch {
    // ignore
  }
}

export function getDeviceClaimedVip(): VipMember | null {
  try {
    const raw = localStorage.getItem(DEVICE_CLAIM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setDeviceClaimedVip(member: VipMember): void {
  try {
    localStorage.setItem(DEVICE_CLAIM_KEY, JSON.stringify(member));
  } catch {
    // ignore
  }
}

export function generateVipCode(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `VIP-${randomDigits}-GLOW`;
}

/**
 * Sync from Firestore and listen to real-time additions so admin always has the latest records.
 */
export function subscribeToVipMembers(callback: (members: VipMember[]) => void): () => void {
  try {
    const q = query(collection(db, FIRESTORE_COLLECTION), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const cloudMembers: VipMember[] = [];
        snapshot.forEach((docSnap) => {
          cloudMembers.push(docSnap.data() as VipMember);
        });

        // Merge with local storage if any
        const local = getLocalVipMembers();
        const mergedMap = new Map<string, VipMember>();

        // Local first
        local.forEach((m) => mergedMap.set(m.normalizedContact || m.contact, m));
        // Cloud overrides / adds
        cloudMembers.forEach((m) => mergedMap.set(m.normalizedContact || m.contact, m));

        const mergedList = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        saveLocalVipMembers(mergedList);
        callback(mergedList);
      },
      (error) => {
        console.warn('Firestore subscription fallback to local storage:', error);
        callback(getLocalVipMembers());
      }
    );
  } catch (err) {
    console.warn('Firestore initialization error:', err);
    callback(getLocalVipMembers());
    return () => {};
  }
}

/**
 * Fetch all VIP members from Firestore with fallback to LocalStorage
 */
export async function fetchAllVipMembers(): Promise<VipMember[]> {
  try {
    const q = query(collection(db, FIRESTORE_COLLECTION), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const cloudMembers: VipMember[] = [];
    snapshot.forEach((docSnap) => {
      cloudMembers.push(docSnap.data() as VipMember);
    });

    const local = getLocalVipMembers();
    const mergedMap = new Map<string, VipMember>();
    local.forEach((m) => mergedMap.set(m.normalizedContact || m.contact, m));
    cloudMembers.forEach((m) => mergedMap.set(m.normalizedContact || m.contact, m));

    const mergedList = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    saveLocalVipMembers(mergedList);
    return mergedList;
  } catch (error) {
    console.warn('Could not fetch from Firestore, using local storage:', error);
    return getLocalVipMembers();
  }
}

export function getVipMembers(): VipMember[] {
  return getLocalVipMembers();
}

/**
 * Strictly registers a VIP member in Firestore Cloud Database AND LocalStorage
 */
export async function registerVipMemberAsync(contactInput: string): Promise<{
  member: VipMember;
  status: VipRegistrationStatus;
}> {
  const { normalized, type } = normalizeContact(contactInput);
  const rawContact = contactInput.trim();

  // 1. Check if device has already claimed a VIP code
  const deviceClaim = getDeviceClaimedVip();
  if (deviceClaim) {
    return {
      member: deviceClaim,
      status: deviceClaim.normalizedContact === normalized ? 'already_registered_contact' : 'already_claimed_device',
    };
  }

  // 2. Check local & existing members
  const localMembers = getLocalVipMembers();
  const existingLocal = localMembers.find((m) => m.normalizedContact === normalized);
  if (existingLocal) {
    setDeviceClaimedVip(existingLocal);
    return {
      member: existingLocal,
      status: 'already_registered_contact',
    };
  }

  // 3. Generate unique VIP code
  let newCode = generateVipCode();
  while (localMembers.some((m) => m.code === newCode)) {
    newCode = generateVipCode();
  }

  const newMember: VipMember = {
    contact: rawContact,
    normalizedContact: normalized,
    code: newCode,
    type,
    date: new Date().toISOString(),
  };

  // 4. Save to LocalStorage immediately
  localMembers.unshift(newMember);
  saveLocalVipMembers(localMembers);
  setDeviceClaimedVip(newMember);

  // 5. Persist permanently to Firebase Cloud Firestore!
  try {
    const docId = normalized.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, FIRESTORE_COLLECTION, docId);
    await setDoc(docRef, newMember, { merge: true });
  } catch (cloudErr) {
    console.warn('Could not save VIP directly to Firestore cloud (saved locally):', cloudErr);
  }

  return {
    member: newMember,
    status: 'new',
  };
}

/**
 * Synchronous register wrapper for backward compatibility
 */
export function registerVipMember(contactInput: string): {
  member: VipMember;
  status: VipRegistrationStatus;
} {
  const { normalized, type } = normalizeContact(contactInput);
  const rawContact = contactInput.trim();

  const deviceClaim = getDeviceClaimedVip();
  if (deviceClaim) {
    return {
      member: deviceClaim,
      status: deviceClaim.normalizedContact === normalized ? 'already_registered_contact' : 'already_claimed_device',
    };
  }

  const localMembers = getLocalVipMembers();
  const existingLocal = localMembers.find((m) => m.normalizedContact === normalized);
  if (existingLocal) {
    setDeviceClaimedVip(existingLocal);
    return {
      member: existingLocal,
      status: 'already_registered_contact',
    };
  }

  let newCode = generateVipCode();
  while (localMembers.some((m) => m.code === newCode)) {
    newCode = generateVipCode();
  }

  const newMember: VipMember = {
    contact: rawContact,
    normalizedContact: normalized,
    code: newCode,
    type,
    date: new Date().toISOString(),
  };

  localMembers.unshift(newMember);
  saveLocalVipMembers(localMembers);
  setDeviceClaimedVip(newMember);

  // Fire-and-forget save to Firestore cloud
  try {
    const docId = normalized.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, FIRESTORE_COLLECTION, docId);
    setDoc(docRef, newMember, { merge: true }).catch((err) =>
      console.warn('Firestore setDoc async error:', err)
    );
  } catch (err) {
    console.warn('Firestore setDoc trigger error:', err);
  }

  return {
    member: newMember,
    status: 'new',
  };
}

export function isValidCoupon(code: string): boolean {
  const upper = code.trim().toUpperCase();
  if (upper === 'GLOW20' || upper === 'GLOWISTIC20' || upper === 'LILAS20') {
    return true;
  }
  if (/^VIP-\d{4}-GLOW$/.test(upper) || /^GLOW-VIP-\d{4}$/.test(upper) || upper.startsWith('VIP-')) {
    return true;
  }
  const members = getLocalVipMembers();
  return members.some((m) => m.code.toUpperCase() === upper);
}

/**
 * Generates an Excel-ready CSV string with UTF-8 BOM for perfect Kurdish/Arabic character support.
 */
export function generateVipCsv(membersList?: VipMember[]): string {
  const members = membersList || getLocalVipMembers();
  const headers = [
    'ژمارە (ID)',
    'کۆدی VIP',
    'پەیوەندی (مۆبایل یان ئیمەیڵ)',
    'جۆر',
    'بەروار و کاتی تۆمارکردن',
    'داشکاندن',
    'دۆخ',
  ];

  const rows = members.map((m, index) => {
    const dateFormatted = new Date(m.date).toLocaleString('en-GB', { timeZone: 'Asia/Baghdad' });
    const typeLabel = m.type === 'phone' ? 'ژمارەی مۆبایل' : 'ئیمەیڵ';
    return [
      index + 1,
      `"${m.code}"`,
      `"${m.contact}"`,
      `"${typeLabel}"`,
      `"${dateFormatted}"`,
      '"20%"',
      '"تۆمارکراو (VIP)"',
    ].join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Downloads the VIP waitlist as an Excel (.csv) file directly.
 */
export function downloadVipExcel(membersList?: VipMember[]): void {
  const csvContent = generateVipCsv(membersList);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `glowistic_vip_members_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

if (typeof window !== 'undefined') {
  (window as unknown as {
    downloadVipExcel: (list?: VipMember[]) => Promise<void>;
    getVipWaitlist: () => Promise<VipMember[]>;
  }).downloadVipExcel = async (list?: VipMember[]) => {
    if (list) {
      downloadVipExcel(list);
    } else {
      const cloudMembers = await fetchAllVipMembers();
      downloadVipExcel(cloudMembers);
    }
  };
  (window as unknown as {
    downloadVipExcel: (list?: VipMember[]) => Promise<void>;
    getVipWaitlist: () => Promise<VipMember[]>;
  }).getVipWaitlist = async () => {
    return await fetchAllVipMembers();
  };
}

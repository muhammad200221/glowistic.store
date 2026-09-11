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

/**
 * Normalizes phone numbers & emails to prevent circumventing with spaces, country codes, or casings.
 * e.g. "+964 770 123 4567", "009647701234567", "0770-123-4567", "7701234567" all resolve to "07701234567"
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

export function getVipMembers(): VipMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
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

export function findVipMember(contact: string): VipMember | undefined {
  const { normalized } = normalizeContact(contact);
  const members = getVipMembers();
  return members.find(m => m.normalizedContact === normalized);
}

export function generateVipCode(): string {
  // Generate random 4-digit unique code: VIP-XXXX-GLOW
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `VIP-${randomDigits}-GLOW`;
}

/**
 * Strictly enforces ONE code per mobile phone / device / contact number.
 */
export function registerVipMember(contactInput: string): {
  member: VipMember;
  status: VipRegistrationStatus;
} {
  const { normalized, type } = normalizeContact(contactInput);
  const rawContact = contactInput.trim();

  // 1. Check if device has already claimed a VIP code
  const deviceClaim = getDeviceClaimedVip();
  if (deviceClaim) {
    // If the device already claimed a code, enforce strict 1-code-per-mobile rule
    return {
      member: deviceClaim,
      status: deviceClaim.normalizedContact === normalized ? 'already_registered_contact' : 'already_claimed_device',
    };
  }

  // 2. Check if this contact number/email was already registered
  const existing = findVipMember(rawContact);
  if (existing) {
    // Lock this existing member to the device
    setDeviceClaimedVip(existing);
    return {
      member: existing,
      status: 'already_registered_contact',
    };
  }

  // 3. Create a brand new unique VIP code
  const members = getVipMembers();
  let newCode = generateVipCode();
  while (members.some(m => m.code === newCode)) {
    newCode = generateVipCode();
  }

  const newMember: VipMember = {
    contact: rawContact,
    normalizedContact: normalized,
    code: newCode,
    type,
    date: new Date().toISOString(),
  };

  members.push(newMember);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch {
    // ignore
  }

  // Lock to device so no other code can be claimed on this mobile phone
  setDeviceClaimedVip(newMember);

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
  // Matches any VIP code format
  if (/^VIP-\d{4}-GLOW$/.test(upper) || /^GLOW-VIP-\d{4}$/.test(upper) || upper.startsWith('VIP-')) {
    return true;
  }
  // Also check dynamically stored codes
  const members = getVipMembers();
  return members.some(m => m.code.toUpperCase() === upper);
}

/**
 * Generates an Excel-ready CSV string with UTF-8 BOM for perfect Kurdish/Arabic character support.
 */
export function generateVipCsv(): string {
  const members = getVipMembers();
  const headers = ['ژمارە (ID)', 'کۆدی VIP', 'پەیوەندی (مۆبایل یان ئیمەیڵ)', 'جۆر', 'بەروار و کاتی تۆمارکردن', 'داشکاندن', 'دۆخ'];
  
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

  // UTF-8 BOM (\uFEFF) ensures Microsoft Excel correctly detects UTF-8 Arabic/Kurdish characters
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Downloads the VIP waitlist as an Excel (.csv) file directly.
 */
export function downloadVipExcel(): void {
  const csvContent = generateVipCsv();
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

// Attach to window object for convenient access from browser console if needed
if (typeof window !== 'undefined') {
  (window as unknown as { downloadVipExcel: () => void; getVipWaitlist: () => VipMember[] }).downloadVipExcel = downloadVipExcel;
  (window as unknown as { downloadVipExcel: () => void; getVipWaitlist: () => VipMember[] }).getVipWaitlist = getVipMembers;
}


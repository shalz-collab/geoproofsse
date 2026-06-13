export type VerificationStatus = "verified" | "suspicious" | "tampered";

export interface Verification {
  id: string;
  shortId: string;
  imageDataUrl: string;
  qrDataUrl?: string;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  address: string;
  timestamp: string;
  hash: string;
  status: VerificationStatus;
  confidence: number;
  device: string;
  notes?: string;
}

const KEY = "geoproof.verifications.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadAll(): Verification[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Verification[];
  } catch {
    return [];
  }
}

export function saveAll(list: Verification[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("geoproof:updated"));
}

export function addVerification(v: Verification) {
  const list = loadAll();
  list.unshift(v);
  saveAll(list);
}

export function findVerification(id: string): Verification | undefined {
  return loadAll().find((v) => v.id === id || v.shortId === id);
}

export async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function shortIdFromHash(hash: string) {
  return hash.slice(0, 4).toUpperCase();
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`,
      { headers: { Accept: "application/json" } },
    );
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}
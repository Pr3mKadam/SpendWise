import type { DeviceInfo } from './types';
import { STORAGE_KEYS } from '@/constants';

const STORAGE_KEY = 'sw_trusted_devices';

function getStoredDevices(): DeviceInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistDevices(devices: DeviceInfo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  } catch {
    // storage full — non-critical
  }
}

function getDeviceFingerprint(): string {
  const NAV_KEYS = [
    'userAgent',
    'language',
    'platform',
    'hardwareConcurrency',
    'deviceMemory',
    'maxTouchPoints',
  ] as const;

  const parts = NAV_KEYS.map(k => {
    const v = (navigator as unknown as Record<string, unknown>)[k];
    return v !== undefined ? `${k}:${String(v)}` : '';
  }).filter(Boolean);

  const screenRes = `${screen.width}x${screen.height}x${screen.colorDepth}`;
  parts.push(`screen:${screenRes}`);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  parts.push(`tz:${timezone}`);

  const combined = parts.join('|');

  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function generateDeviceLabel(): string {
  const ua = navigator.userAgent;
  let label = 'Unknown Device';

  if (/iPhone|iPad|iPod/.test(ua)) label = 'iOS Device';
  else if (/Android/.test(ua)) label = 'Android Device';
  else if (/Windows/.test(ua)) label = 'Windows PC';
  else if (/Mac/.test(ua)) label = 'Mac';
  else if (/Linux/.test(ua)) label = 'Linux PC';
  else if (/CrOS/.test(ua)) label = 'Chromebook';

  if (/Chrome/.test(ua) && !/Edg/.test(ua)) label += ' (Chrome)';
  else if (/Firefox/.test(ua)) label += ' (Firefox)';
  else if (/Safari/.test(ua)) label += ' (Safari)';
  else if (/Edg/.test(ua)) label += ' (Edge)';

  return label;
}

export class DeviceManager {
  private currentDeviceId: string | null = null;

  constructor() {
    this.loadCurrentDeviceId();
  }

  private loadCurrentDeviceId(): void {
    const stored = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (stored) {
      this.currentDeviceId = stored;
      return;
    }
    const fingerprint = getDeviceFingerprint();
    const existing = getStoredDevices().find(d => d.id === fingerprint);
    if (existing) {
      this.currentDeviceId = fingerprint;
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, fingerprint);
      return;
    }
    const newId = `dev_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    this.currentDeviceId = newId;
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, newId);
  }

  getCurrentDeviceId(): string {
    if (!this.currentDeviceId) this.loadCurrentDeviceId();
    return this.currentDeviceId!;
  }

  getDeviceLabel(): string {
    const id = this.getCurrentDeviceId();
    const devices = getStoredDevices();
    const device = devices.find(d => d.id === id);
    return device?.label || generateDeviceLabel();
  }

  isCurrentDeviceTrusted(): boolean {
    const id = this.getCurrentDeviceId();
    const devices = getStoredDevices();
    const device = devices.find(d => d.id === id);
    return device?.trusted ?? false;
  }

  trustCurrentDevice(): DeviceInfo {
    const id = this.getCurrentDeviceId();
    const devices = getStoredDevices();
    const idx = devices.findIndex(d => d.id === id);

    const device: DeviceInfo = {
      id,
      label: generateDeviceLabel(),
      trusted: true,
      lastUsed: new Date().toISOString(),
      createdAt: idx >= 0 ? devices[idx].createdAt : new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    if (idx >= 0) {
      devices[idx] = device;
    } else {
      devices.push(device);
    }

    persistDevices(devices);
    return device;
  }

  revokeDevice(deviceId: string): void {
    const devices = getStoredDevices().filter(d => d.id !== deviceId);
    persistDevices(devices);
  }

  revokeAllDevices(): void {
    persistDevices([]);
  }

  listTrustedDevices(): DeviceInfo[] {
    return getStoredDevices();
  }

  updateLastUsed(): void {
    const id = this.getCurrentDeviceId();
    const devices = getStoredDevices();
    const idx = devices.findIndex(d => d.id === id);
    if (idx >= 0) {
      devices[idx].lastUsed = new Date().toISOString();
      persistDevices(devices);
    }
  }
}

export const deviceManager = new DeviceManager();

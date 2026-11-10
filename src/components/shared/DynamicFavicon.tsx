'use client';

import { useEffect } from 'react';
import { useStore } from '@/context/StoreContext';

/**
 * Dynamically synchronizes the browser tab favicon in real-time
 * from the admin-configured Cloudinary URL stored in MongoDB.
 * Never reads from localStorage — always uses live context data.
 */
export function DynamicFavicon() {
  const { platformSettings, isPlatformLoading } = useStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Wait until MongoDB data has loaded before touching the favicon
    if (isPlatformLoading) return;

    const rawUrl = platformSettings?.faviconUrl || '/favicon.ico';
    // For remote (Cloudinary) URLs add a cache-busting timestamp
    const faviconUrl = rawUrl.startsWith('http')
      ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}t=${Date.now()}`
      : rawUrl;

    // Find or create all favicon link elements
    let linkElements: HTMLLinkElement[] = Array.from(
      document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']")
    );

    if (linkElements.length === 0) {
      const newIcon = document.createElement('link');
      newIcon.rel = 'icon';
      document.head.appendChild(newIcon);

      const newShortcut = document.createElement('link');
      newShortcut.rel = 'shortcut icon';
      document.head.appendChild(newShortcut);

      linkElements = [newIcon, newShortcut];
    }

    linkElements.forEach((link) => {
      link.href = faviconUrl;
    });
  }, [platformSettings?.faviconUrl, isPlatformLoading]);

  return null;
}

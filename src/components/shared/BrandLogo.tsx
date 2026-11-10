'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { Music } from 'lucide-react';

interface BrandIconProps {
  className?: string;
  iconClassName?: string;
}

export const BrandIcon: React.FC<BrandIconProps> = ({
  className = 'w-10 h-10',
  iconClassName = 'w-5 h-5',
}) => {
  const { platformSettings, isPlatformLoading } = useStore();
  const [hasError, setHasError] = useState(false);

  const faviconUrl = platformSettings?.faviconUrl;
  const isCustomLogo = Boolean(
    faviconUrl &&
      faviconUrl !== '/favicon.ico' &&
      (faviconUrl.startsWith('http') || faviconUrl.startsWith('/') || faviconUrl.startsWith('data:'))
  );

  // Reset error whenever URL changes (new upload should always display)
  useEffect(() => {
    setHasError(false);
  }, [faviconUrl]);

  // ── While MongoDB fetch is still loading, show subtle neutral pulse ──
  if (isPlatformLoading) {
    return (
      <div
        className={`${className} rounded-xl bg-zinc-800/60 animate-pulse shrink-0`}
        aria-hidden="true"
      />
    );
  }

  // ── Custom online favicon/logo from Cloudinary is loaded ──
  if (isCustomLogo && !hasError && faviconUrl) {
    return (
      <div
        className={`${className} flex items-center justify-center shrink-0 relative transition-transform select-none bg-transparent overflow-hidden`}
      >
        <img
          key={faviconUrl}
          src={faviconUrl}
          alt="Guitart Brand Logo"
          onError={() => setHasError(true)}
          className="w-full h-full object-contain filter drop-shadow-sm"
          style={{ background: 'transparent' }}
        />
      </div>
    );
  }

  // ── Default fallback if no custom logo is uploaded in MongoDB ──
  return (
    <div
      className={`${className} bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-950/50 rounded-xl overflow-hidden shrink-0 relative transition-transform`}
    >
      <Music className={`${iconClassName} fill-current`} />
    </div>
  );
};

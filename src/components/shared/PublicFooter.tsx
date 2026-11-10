'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Music, Mail, Phone, MapPin } from 'lucide-react';
import { BrandIcon } from '@/components/shared/BrandLogo';
import { SocialIcon } from '@/components/shared/SocialIcon';
import { DEFAULT_SOCIAL_LINKS } from '@/lib/mockData';

export const PublicFooter: React.FC = () => {
  const { platformSettings, adminName } = useStore();

  const academyEmail = platformSettings?.academyEmail || 'support@guitart.com';
  const academyPhone = platformSettings?.academyPhone || '+880 1711-000000';
  const academyAddress = platformSettings?.address || 'Banani, Dhaka-1213, Bangladesh';

  // Get active configured social media links
  const socialLinks = (platformSettings?.socialLinks || DEFAULT_SOCIAL_LINKS).filter(
    (item) => item.isEnabled && item.url && item.url.trim().length > 0
  );

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-400 pt-14 pb-12 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 md:gap-16 pb-12 border-b border-zinc-800">
          {/* Brand Info */}
          <div className="space-y-4 max-w-md">
            <Link href="/" className="flex items-center gap-3 group">
              <BrandIcon className="w-10 h-10 rounded-xl group-hover:scale-105 transition-transform" />
              <span className="text-xl font-extrabold tracking-wider text-white font-mono">
                GUITART<span className="text-amber-400">.</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed font-light">
              Premium guitar learning platform created by virtuosic guitarist & instructor {adminName}. Elevate your guitar craft with structured masterclasses, custom backing jams, interactive tabs, and direct mentorship.
            </p>

            {/* Dynamic Social & Media Links with Authentic Icons */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2.5 flex-wrap pt-1">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-zinc-850 hover:shadow-md hover:shadow-amber-950/30 transition shadow-sm"
                    title={link.label || link.platform}
                    aria-label={link.label || link.platform}
                  >
                    <SocialIcon platform={link.platform} className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Academy Contact */}
          <div className="space-y-4 max-w-xs shrink-0">
            <h4 className="text-white font-bold font-mono text-sm tracking-wider uppercase">
              Academy Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">{academyAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-zinc-300 font-mono">{academyPhone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-zinc-300">{academyEmail}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Guitart Academy by {adminName}. All rights reserved.</p>
          <div className="flex flex-wrap gap-5 sm:gap-6">
            <Link href="/privacy-policy" className="hover:text-amber-400 transition">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-amber-400 transition">
              Terms of Service
            </Link>
            <Link href="/bkash-faq" className="hover:text-amber-400 transition">
              bKash Payment FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { PublicNavbar } from '@/components/shared/PublicNavbar';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { DynamicFavicon } from '@/components/shared/DynamicFavicon';
import { GlobalNoticePopup } from '@/components/shared/GlobalNoticePopup';
import { connectToDatabase } from '@/lib/mongodb';
import BillingSettings from '@/models/BillingSettings';
import CmsSectionModel from '@/models/CmsSection';
import { PlatformSettings, HomepageSection } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = '/favicon.ico';
  let directorName = 'Ershad Zaman';
  try {
    await connectToDatabase();
    const settings = await BillingSettings.findOne().lean() as any;
    if (settings?.faviconUrl && settings.faviconUrl !== '/favicon.ico' && settings.faviconUrl.startsWith('http')) {
      faviconUrl = settings.faviconUrl;
    }
    if (settings?.directorName) {
      directorName = settings.directorName;
    }
  } catch (e) {
    // offline/fallback
  }

  return {
    title: `Guitart — ${directorName} Guitar Academy`,
    description: `Premium guitar learning platform created by guitarist & instructor ${directorName}. Access video masterclasses, custom TAB notations, backing tracks, and live mentorship.`,
    icons: {
      icon: [
        {
          url: faviconUrl,
        },
      ],
      shortcut: [faviconUrl],
      apple: [faviconUrl],
    },
    openGraph: {
      title: `Guitart — ${directorName} Guitar Academy`,
      description: `Master acoustic & electric guitar with ${directorName}. Structured lessons, PDF tabs, & student portal.`,
      url: 'https://guitart.com',
      siteName: 'Guitart Academy',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
          width: 1200,
          height: 630,
          alt: `${directorName} Guitart Academy`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialPlatformSettings: PlatformSettings | undefined = undefined;
  let initialCmsSections: HomepageSection[] | undefined = undefined;

  try {
    await connectToDatabase();
    const [settings, sections] = await Promise.all([
      BillingSettings.findOne().lean() as any,
      CmsSectionModel.find().sort({ order: 1 }).lean(),
    ]);

    if (settings) {
      initialPlatformSettings = {
        bKashNumber: settings.bKashNumber || '01711-000000',
        faviconUrl: settings.faviconUrl || '/favicon.ico',
        directorName: settings.directorName || 'Ershad Zaman',
        academyEmail: settings.academyEmail || 'ershad@guitart.com',
        academyPhone: settings.academyPhone || '+880 1711-000000',
        address: settings.address || 'Banani, Dhaka-1213, Bangladesh',
        socialLinks: Array.isArray(settings.socialLinks) ? settings.socialLinks : [],
      };
    }

    if (sections && sections.length > 0) {
      initialCmsSections = sections.map((s) => ({
        id: s.sectionKey,
        title: s.title,
        subtitle: s.subtitle || '',
        content: s.content,
        imageUrl: s.imageUrl || '',
        buttonText: s.buttonText || '',
        buttonLink: s.buttonLink || '',
        enabled: s.enabled,
        order: s.order,
      }));
    }
  } catch (e) {
    console.warn('RootLayout SSR data fetch notice:', e);
  }

  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <StoreProvider
          initialPlatformSettings={initialPlatformSettings}
          initialCmsSections={initialCmsSections}
        >
          <DynamicFavicon />
          <PublicNavbar />
          {children}
          <GlobalNoticePopup />
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BillingSettings from '@/models/BillingSettings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await BillingSettings.findOne().lean() as any;
    if (settings?.faviconUrl && settings.faviconUrl !== '/favicon.ico' && settings.faviconUrl.startsWith('http')) {
      return NextResponse.redirect(settings.faviconUrl, {
        status: 307,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }
  } catch (e) {
    console.warn('Favicon route DB lookup notice:', e);
  }

  // Fallback transparent 1x1 or empty response with SVG icon
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><circle cx="12" cy="12" r="10" fill="#f59e0b"/><path d="M9 18V5l12-2v13" stroke="#000" stroke-width="2" fill="none"/></svg>`;
  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

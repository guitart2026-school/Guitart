import { NextRequest, NextResponse } from 'next/server';
import { extractGoogleDriveId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get('url');

    if (!rawUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    let targetUrl = decodeURIComponent(rawUrl).trim();

    // Check if it's a Google Drive link
    const gdriveId = extractGoogleDriveId(targetUrl);
    if (gdriveId) {
      targetUrl = `https://docs.google.com/uc?export=download&id=${gdriveId}`;
    }

    // Fetch the audio stream on the server side (bypassing browser CORS/hotlink restrictions)
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    // Forward range header if present (for seeking)
    const rangeHeader = req.headers.get('range');
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    const response = await fetch(targetUrl, {
      headers,
      redirect: 'follow',
    });

    if (!response.ok && response.status !== 206) {
      return NextResponse.json(
        { error: `Audio source returned status ${response.status}` },
        { status: response.status }
      );
    }

    const responseHeaders = new Headers();
    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    responseHeaders.set('Content-Type', contentType.includes('html') ? 'audio/mpeg' : contentType);
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Cache-Control', 'public, max-age=86400');

    const contentLength = response.headers.get('content-length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);

    const contentRange = response.headers.get('content-range');
    if (contentRange) responseHeaders.set('Content-Range', contentRange);

    return new NextResponse(response.body, {
      status: response.status === 206 ? 206 : 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to stream audio' },
      { status: 500 }
    );
  }
}

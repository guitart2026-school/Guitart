import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BillingSettings from '@/models/BillingSettings';
import { MOCK_COUPONS, DEFAULT_NOTICE_BOARD, DEFAULT_DELIVERY_FEES } from '@/lib/mockData';

// Helper to get or create settings
async function getOrCreateBillingSettings() {
  let settings = await BillingSettings.findOne().lean() as any;
  if (!settings) {
    const created = await BillingSettings.create({
      insideDhakaDeliveryFee: DEFAULT_DELIVERY_FEES.insideDhaka,
      outsideDhakaDeliveryFee: DEFAULT_DELIVERY_FEES.outsideDhaka,
      coupons: MOCK_COUPONS,
      noticeBoard: DEFAULT_NOTICE_BOARD,
      faviconUrl: '/favicon.ico',
      directorName: 'Ershad Zaman',
      academyEmail: 'ershad@guitart.com',
      academyPhone: '+880 1711-000000',
      address: 'Banani, Dhaka-1213, Bangladesh',
      socialLinks: [],
    });
    settings = created.toObject ? created.toObject() : created;
    console.log('✅ Initialized default billing settings in MongoDB');
  }
  return settings;
}

// GET /api/billing
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await getOrCreateBillingSettings();

    return NextResponse.json({
      success: true,
      bKashNumber: settings.bKashNumber || '01711-000000',
      deliveryFees: {
        insideDhaka: settings.insideDhakaDeliveryFee ?? 80,
        outsideDhaka: settings.outsideDhakaDeliveryFee ?? 150,
      },
      coupons: settings.coupons || [],
      noticeBoard: settings.noticeBoard || DEFAULT_NOTICE_BOARD,
      platformSettings: {
        bKashNumber: settings.bKashNumber || '01711-000000',
        faviconUrl: settings.faviconUrl || '/favicon.ico',
        directorName: settings.directorName || 'Ershad Zaman',
        academyEmail: settings.academyEmail || 'ershad@guitart.com',
        academyPhone: settings.academyPhone || '+880 1711-000000',
        address: settings.address || 'Banani, Dhaka-1213, Bangladesh',
        socialLinks: Array.isArray(settings.socialLinks) ? settings.socialLinks : [],
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.warn('Billing fetch offline notice:', error?.message);
    return NextResponse.json({
      success: true,
      bKashNumber: '01711-000000',
      deliveryFees: DEFAULT_DELIVERY_FEES,
      coupons: MOCK_COUPONS,
      noticeBoard: DEFAULT_NOTICE_BOARD,
      platformSettings: {
        bKashNumber: '01711-000000',
        faviconUrl: '/favicon.ico',
        directorName: 'Ershad Zaman',
        academyEmail: 'ershad@guitart.com',
        academyPhone: '+880 1711-000000',
        address: 'Banani, Dhaka-1213, Bangladesh',
        socialLinks: [],
      },
    });
  }
}

// POST /api/billing — update delivery fees, coupons, notice board, or bkash number & platform settings
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { action, bKashNumber, deliveryFees, coupons, noticeBoard, platformSettings } = body;

    const updateSet: Record<string, any> = {};

    if (bKashNumber) {
      updateSet.bKashNumber = bKashNumber.trim();
    }

    if (action === 'updatePlatformSettings' || platformSettings) {
      const p = platformSettings || body;
      if (p.faviconUrl !== undefined) updateSet.faviconUrl = p.faviconUrl;
      if (p.directorName !== undefined) updateSet.directorName = p.directorName;
      if (p.academyEmail !== undefined) updateSet.academyEmail = p.academyEmail;
      if (p.academyPhone !== undefined) updateSet.academyPhone = p.academyPhone;
      if (p.address !== undefined) updateSet.address = p.address;
      if (p.socialLinks !== undefined) updateSet.socialLinks = p.socialLinks;
      if (p.bKashNumber !== undefined) updateSet.bKashNumber = p.bKashNumber;
    }

    if (action === 'updateBKashNumber' && bKashNumber) {
      updateSet.bKashNumber = bKashNumber.trim();
    } else if (action === 'updateDeliveryFees' && deliveryFees) {
      updateSet.insideDhakaDeliveryFee = Number(deliveryFees.insideDhaka) || 0;
      updateSet.outsideDhakaDeliveryFee = Number(deliveryFees.outsideDhaka) || 0;
    } else if (action === 'updateNoticeBoard' && noticeBoard) {
      updateSet.noticeBoard = {
        ...noticeBoard,
        updatedAt: new Date().toISOString(),
      };
    } else if (action === 'updateCoupons' && Array.isArray(coupons)) {
      updateSet.coupons = coupons;
    } else if (action === 'saveAll') {
      if (bKashNumber) updateSet.bKashNumber = bKashNumber.trim();
      if (deliveryFees) {
        updateSet.insideDhakaDeliveryFee = Number(deliveryFees.insideDhaka) || 0;
        updateSet.outsideDhakaDeliveryFee = Number(deliveryFees.outsideDhaka) || 0;
      }
      if (coupons && Array.isArray(coupons)) updateSet.coupons = coupons;
      if (noticeBoard) {
        updateSet.noticeBoard = {
          ...noticeBoard,
          updatedAt: new Date().toISOString(),
        };
      }
      if (platformSettings) {
        if (platformSettings.faviconUrl !== undefined) updateSet.faviconUrl = platformSettings.faviconUrl;
        if (platformSettings.directorName !== undefined) updateSet.directorName = platformSettings.directorName;
        if (platformSettings.academyEmail !== undefined) updateSet.academyEmail = platformSettings.academyEmail;
        if (platformSettings.academyPhone !== undefined) updateSet.academyPhone = platformSettings.academyPhone;
        if (platformSettings.address !== undefined) updateSet.address = platformSettings.address;
        if (platformSettings.socialLinks !== undefined) updateSet.socialLinks = platformSettings.socialLinks;
      }
    }

    // Atomically find one and update with $set
    let updatedDoc = await BillingSettings.findOneAndUpdate(
      {},
      { $set: updateSet },
      { new: true, upsert: true, lean: true, setDefaultsOnInsert: true }
    ) as any;

    return NextResponse.json({
      success: true,
      bKashNumber: updatedDoc.bKashNumber || '01711-000000',
      deliveryFees: {
        insideDhaka: updatedDoc.insideDhakaDeliveryFee ?? 80,
        outsideDhaka: updatedDoc.outsideDhakaDeliveryFee ?? 150,
      },
      coupons: updatedDoc.coupons || [],
      noticeBoard: updatedDoc.noticeBoard || DEFAULT_NOTICE_BOARD,
      platformSettings: {
        bKashNumber: updatedDoc.bKashNumber || '01711-000000',
        faviconUrl: updatedDoc.faviconUrl || '/favicon.ico',
        directorName: updatedDoc.directorName || 'Ershad Zaman',
        academyEmail: updatedDoc.academyEmail || 'ershad@guitart.com',
        academyPhone: updatedDoc.academyPhone || '+880 1711-000000',
        address: updatedDoc.address || 'Banani, Dhaka-1213, Bangladesh',
        socialLinks: Array.isArray(updatedDoc.socialLinks) ? updatedDoc.socialLinks : [],
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save billing settings' }, { status: 500 });
  }
}

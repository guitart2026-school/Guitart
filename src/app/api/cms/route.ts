import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import CmsSectionModel from '@/models/CmsSection';
import { MOCK_CMS_SECTIONS } from '@/lib/mockData';

async function seedCmsIfEmpty() {
  const count = await CmsSectionModel.countDocuments();
  if (count === 0) {
    await CmsSectionModel.insertMany(
      MOCK_CMS_SECTIONS.map((s) => ({
        sectionKey: s.id,
        title: s.title,
        subtitle: s.subtitle || '',
        content: s.content,
        imageUrl: s.imageUrl || '',
        buttonText: s.buttonText || '',
        buttonLink: s.buttonLink || '',
        enabled: s.enabled,
        order: s.order,
      }))
    );
    console.log('✅ Seeded cms_sections collection');
  }
}

// GET /api/cms
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await seedCmsIfEmpty();

    const sections = await CmsSectionModel.find().sort({ order: 1 }).lean();

    return NextResponse.json({
      success: true,
      cmsSections: sections.map((s) => ({
        id: s.sectionKey,
        title: s.title,
        subtitle: s.subtitle || '',
        content: s.content,
        imageUrl: s.imageUrl || '',
        buttonText: s.buttonText || '',
        buttonLink: s.buttonLink || '',
        enabled: s.enabled,
        order: s.order,
      })),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch CMS sections' }, { status: 500 });
  }
}

// PATCH /api/cms?key=sec-hero — update a specific section
export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (!key) return NextResponse.json({ error: 'key param required' }, { status: 400 });

    const body = await req.json();

    const updateData: Record<string, any> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.buttonText !== undefined) updateData.buttonText = body.buttonText;
    if (body.buttonLink !== undefined) updateData.buttonLink = body.buttonLink;
    if (body.enabled !== undefined) updateData.enabled = body.enabled;
    if (body.order !== undefined) updateData.order = body.order;

    const section = await CmsSectionModel.findOneAndUpdate(
      { sectionKey: key },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean() as any;

    if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      cmsSection: {
        id: section.sectionKey,
        title: section.title,
        subtitle: section.subtitle || '',
        content: section.content,
        imageUrl: section.imageUrl || '',
        buttonText: section.buttonText || '',
        buttonLink: section.buttonLink || '',
        enabled: section.enabled,
        order: section.order,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update CMS section' }, { status: 500 });
  }
}

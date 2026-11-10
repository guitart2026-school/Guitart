import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import { MOCK_PRODUCTS } from '@/lib/mockData';

async function seedProductsIfEmpty() {
  const count = await ProductModel.countDocuments();
  if (count === 0) {
    await ProductModel.insertMany(
      MOCK_PRODUCTS.map((p) => ({
        name: p.name,
        description: p.description,
        price: p.price,
        images: p.images,
        stock: p.stock,
        category: p.category,
        isActive: p.isActive,
      }))
    );
    console.log('✅ Seeded products collection');
  }
}

// GET /api/products?category=xxx&activeOnly=true
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await seedProductsIfEmpty();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const query: Record<string, unknown> = {};
    if (category && category !== 'All') query.category = category;
    if (activeOnly) query.isActive = true;

    const products = await ProductModel.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      products: products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        price: p.price,
        images: p.images,
        stock: p.stock,
        category: p.category,
        isActive: p.isActive,
      })),
    });
  } catch (error: any) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const product = await ProductModel.create({
      name: body.name,
      description: body.description,
      price: body.price,
      images: body.images || [],
      stock: body.stock || 0,
      category: body.category,
      isActive: body.isActive !== false,
    });

    return NextResponse.json({
      success: true,
      product: { id: product._id.toString(), ...product.toObject() },
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create product' }, { status: 500 });
  }
}

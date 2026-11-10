import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import OrderModel from '@/models/Order';

// GET /api/orders?studentId=xxx
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const paymentStatus = searchParams.get('paymentStatus');
    const orderStatus = searchParams.get('orderStatus');

    const query: Record<string, unknown> = {};
    if (studentId) query.studentId = studentId;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (orderStatus) query.orderStatus = orderStatus;

    const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      orders: orders.map((o) => ({
        id: o._id.toString(),
        studentId: o.studentId,
        customerName: o.customerName,
        customerMobile: o.customerMobile,
        customerEmail: o.customerEmail,
        deliveryAddress: o.deliveryAddress,
        deliveryMethod: o.deliveryMethod,
        deliveryCharge: o.deliveryCharge,
        items: o.items.map((item) => ({
          product: {
            id: item.productId,
            name: item.productName,
            price: item.productPrice,
            images: [item.productImage],
          },
          quantity: item.quantity,
        })),
        subtotal: o.subtotal,
        totalAmount: o.totalAmount,
        paymentMethod: o.paymentMethod,
        bKashTransactionId: o.bKashTransactionId,
        bKashSenderMobile: o.bKashSenderMobile,
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        notes: o.notes,
        createdAt: o.createdAt instanceof Date
          ? o.createdAt.toISOString().replace('T', ' ').slice(0, 16)
          : String(o.createdAt),
      })),
    });
  } catch (error: any) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const orderItems = (body.items || []).map((item: any) => ({
      productId: item.product?.id || item.productId,
      productName: item.product?.name || item.productName,
      productPrice: item.product?.price || item.productPrice,
      productImage: item.product?.images?.[0] || item.productImage || '',
      quantity: item.quantity,
    }));

    const order = await OrderModel.create({
      studentId: body.studentId,
      customerName: body.customerName,
      customerMobile: body.customerMobile,
      customerEmail: body.customerEmail,
      deliveryAddress: body.deliveryAddress,
      deliveryMethod: body.deliveryMethod,
      deliveryCharge: body.deliveryCharge,
      items: orderItems,
      subtotal: body.subtotal,
      totalAmount: body.totalAmount,
      paymentMethod: body.paymentMethod,
      bKashTransactionId: body.bKashTransactionId || '',
      bKashSenderMobile: body.bKashSenderMobile || '',
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      notes: body.notes || '',
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        ...order.toObject(),
        createdAt: order.createdAt.toISOString().replace('T', ' ').slice(0, 16),
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to place order' }, { status: 500 });
  }
}

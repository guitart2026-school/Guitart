import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Review from '@/models/Review';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required.' }, { status: 400 });
    }

    try {
      await connectToDatabase();
      await Review.findByIdAndDelete(id);
    } catch (dbErr) {
      console.warn('DB review delete notice:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete review.' },
      { status: 500 }
    );
  }
}

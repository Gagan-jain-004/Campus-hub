import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, listingId } = body;

    if (!userId || !listingId) {
      return NextResponse.json({ success: false, error: 'User and listing ID required' }, { status: 400 });
    }

    const existing = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (existing) {
      await prisma.savedListing.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, saved: false });
    } else {
      await prisma.savedListing.create({
        data: {
          userId,
          listingId,
        },
      });
      return NextResponse.json({ success: true, saved: true });
    }
  } catch (error: any) {
    console.error('Error toggling saved listing:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Increment views
    await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    }).catch(() => {});

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            isVerified: true,
            branch: true,
            gradYear: true,
            course: true,
            createdAt: true,
          },
        },
        college: {
          select: {
            id: true,
            name: true,
            shortName: true,
            city: true,
          },
        },
        _count: {
          select: {
            savedBy: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: listing });
  } catch (error: any) {
    console.error('Error fetching listing details:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, price, title, description, negotiable, location } = body;

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(title && { title }),
        ...(description && { description }),
        ...(negotiable !== undefined && { negotiable }),
        ...(location && { location }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating listing:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.listing.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting listing:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

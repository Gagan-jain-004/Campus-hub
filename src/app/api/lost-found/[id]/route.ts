import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.lostFoundPost.findUnique({
      where: { id },
      include: {
        images: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            isVerified: true,
            branch: true,
            course: true,
          },
        },
        college: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error fetching lost/found item:', error);
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
    const { status, title, description, location } = body;

    const updated = await prisma.lostFoundPost.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(description && { description }),
        ...(location && { location }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating lost/found item:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.lostFoundPost.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error: any) {
    console.error('Error deleting lost/found item:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

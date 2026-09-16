import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { userId, type = 'LIKE' } = body;

    if (!userId || !postId) {
      return NextResponse.json({ success: false, error: 'User and post ID required' }, { status: 400 });
    }

    const existing = await prisma.reaction.findUnique({
      where: {
        userId_postId_type: {
          userId,
          postId,
          type,
        },
      },
    });

    if (existing) {
      await prisma.reaction.delete({
        where: { id: existing.id },
      });
      await prisma.communityPost.update({
        where: { id: postId },
        data: { upvotes: { decrement: 1 } },
      });
      return NextResponse.json({ success: true, reacted: false });
    } else {
      await prisma.reaction.create({
        data: {
          userId,
          postId,
          type,
        },
      });
      await prisma.communityPost.update({
        where: { id: postId },
        data: { upvotes: { increment: 1 } },
      });
      return NextResponse.json({ success: true, reacted: true });
    }
  } catch (error: any) {
    console.error('Error reacting to post:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

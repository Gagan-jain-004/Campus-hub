import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { content, isAnonymous, authorId } = body;

    if (!content || !authorId || !postId) {
      return NextResponse.json({ success: false, error: 'Content and author are required' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        isAnonymous: !!isAnonymous,
        authorId,
        postId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    });

    const sanitized = comment.isAnonymous
      ? {
          ...comment,
          author: {
            id: 'anonymous',
            name: 'Anonymous Student',
            username: 'anonymous',
            avatar: null,
            isVerified: false,
          },
        }
      : comment;

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error: any) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

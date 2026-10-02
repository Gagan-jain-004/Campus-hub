import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            isVerified: true,
            branch: true,
            gradYear: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        comments: {
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
          orderBy: { createdAt: 'asc' },
        },
        reactions: true,
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error fetching post:', error);
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
    const { userId, title, content, image, isAnonymous } = body;

    const existingPost = await prisma.communityPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || (existingPost.authorId !== userId && user.role !== 'ADMIN')) {
        return NextResponse.json({ success: false, error: 'You are not authorized to edit this post' }, { status: 403 });
      }
    }

    const updated = await prisma.communityPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content: content.trim() }),
        ...(image !== undefined && { image: image || null }),
        ...(isAnonymous !== undefined && { isAnonymous: !!isAnonymous }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            isVerified: true,
            branch: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        comments: {
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
          orderBy: { createdAt: 'asc' },
        },
        reactions: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const existingPost = await prisma.communityPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || (existingPost.authorId !== userId && user.role !== 'ADMIN')) {
        return NextResponse.json({ success: false, error: 'You are not authorized to delete this post' }, { status: 403 });
      }
    }

    await prisma.communityPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

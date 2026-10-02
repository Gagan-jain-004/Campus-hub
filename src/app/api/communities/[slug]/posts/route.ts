import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId') || undefined;
    const sort = searchParams.get('sort') || 'latest'; // latest, trending, top

    let communityId: string | undefined = undefined;

    if (slug !== 'all') {
      const comm = await prisma.community.findFirst({
        where: {
          slug,
          ...(collegeId && { collegeId }),
        },
      });
      if (comm) {
        communityId = comm.id;
      }
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'top') orderBy = { upvotes: 'desc' };
    if (sort === 'trending') orderBy = [{ upvotes: 'desc' }, { createdAt: 'desc' }];

    const posts = await prisma.communityPost.findMany({
      where: {
        ...(communityId && { communityId }),
        ...(collegeId && { collegeId }),
      },
      orderBy,
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

    // Anonymize author details for anonymous posts for standard student views
    const sanitizedPosts = posts.map((post) => {
      const sanitizedComments = post.comments.map((comment) => {
        if (comment.isAnonymous) {
          return {
            ...comment,
            author: {
              id: 'anonymous',
              name: 'Anonymous Student',
              username: 'anonymous',
              avatar: null,
              isVerified: false,
            },
          };
        }
        return comment;
      });

      if (post.isAnonymous) {
        return {
          ...post,
          author: {
            id: 'anonymous',
            name: 'Anonymous Student',
            username: 'anonymous',
            avatar: null,
            isVerified: false,
            branch: 'Campus Student',
            gradYear: null,
          },
          comments: sanitizedComments,
        };
      }
      return {
        ...post,
        comments: sanitizedComments,
      };
    });

    return NextResponse.json({ success: true, data: sanitizedPosts });
  } catch (error: any) {
    console.error('Error fetching community posts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, content, image, isAnonymous, authorId, userId, collegeId, communityId: explicitCommunityId } = body;

    const resolvedAuthorId = authorId || userId;

    if (!title || !content || !resolvedAuthorId || !collegeId) {
      return NextResponse.json({ success: false, error: 'Title, content, author and campus are required' }, { status: 400 });
    }

    // Verify user exists by id or clerkId
    let user = await prisma.user.findUnique({ where: { id: resolvedAuthorId } });
    if (!user) {
      user = await prisma.user.findUnique({ where: { clerkId: resolvedAuthorId } });
    }
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found. Please log in again.' }, { status: 404 });
    }

    let communityId = explicitCommunityId;
    if (!communityId && slug && slug !== 'all') {
      const comm = await prisma.community.findFirst({
        where: { slug, collegeId },
      });
      if (comm) communityId = comm.id;
    }

    if (!communityId) {
      const fallbackComm = await prisma.community.findFirst({
        where: { collegeId },
      });
      if (fallbackComm) communityId = fallbackComm.id;
    }

    if (!communityId) {
      let generalComm = await prisma.community.findFirst({
        where: { slug: 'general', collegeId },
      });
      if (!generalComm) {
        generalComm = await prisma.community.create({
          data: {
            name: 'Campus Discussion',
            slug: 'general',
            description: 'Campus open discussion feed',
            postingMode: 'PUBLIC',
            collegeId,
          },
        });
      }
      communityId = generalComm.id;
    }

    const post = await prisma.communityPost.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        image: image || null,
        isAnonymous: !!isAnonymous,
        authorId: user.id,
        communityId,
        collegeId,
      },
      include: {
        community: true,
        author: true,
      },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

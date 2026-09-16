import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId') || undefined;

    const communities = await prisma.community.findMany({
      where: collegeId ? { collegeId } : undefined,
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: communities });
  } catch (error: any) {
    console.error('Error fetching communities:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, image, type, postingMode, collegeId, createdById } = body;

    if (!name || !slug || !description || !collegeId) {
      return NextResponse.json({ success: false, error: 'Name, slug, description, and college required' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const community = await prisma.community.create({
      data: {
        name,
        slug: cleanSlug,
        description,
        image: image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80',
        type: type || 'PUBLIC',
        postingMode: postingMode || 'BOTH',
        collegeId,
        createdById,
        members: createdById
          ? {
              create: {
                userId: createdById,
                role: 'ADMIN',
              },
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, data: community });
  } catch (error: any) {
    console.error('Error creating community:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

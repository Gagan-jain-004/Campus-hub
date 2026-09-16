import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId') || undefined;
    const type = searchParams.get('type'); // LOST, FOUND, or ALL
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'ACTIVE';

    const where: any = {
      ...(status !== 'ALL' && { status }),
    };

    if (collegeId) where.collegeId = collegeId;
    if (type && type !== 'ALL') where.type = type;
    if (category && category !== 'ALL') where.category = category;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const posts = await prisma.lostFoundPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json({ success: true, data: posts });
  } catch (error: any) {
    console.error('Error fetching lost & found posts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, description, category, location, dateLostFound, contactInfo, images, authorId, collegeId } = body;

    if (!type || !title || !description || !category || !location || !authorId || !collegeId) {
      return NextResponse.json({ success: false, error: 'All primary fields are required' }, { status: 400 });
    }

    const post = await prisma.lostFoundPost.create({
      data: {
        type,
        title,
        description,
        category,
        location,
        dateLostFound: dateLostFound ? new Date(dateLostFound) : new Date(),
        contactInfo: contactInfo || null,
        authorId,
        collegeId,
        images: {
          create: (images || []).map((url: string) => ({ url })),
        },
      },
      include: {
        images: true,
        author: true,
        college: true,
      },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error creating lost & found post:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

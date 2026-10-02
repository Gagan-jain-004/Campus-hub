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
    const {
      type,
      title,
      description,
      category,
      location,
      dateLostFound,
      contactInfo,
      images,
      authorId,
      userId,
      collegeId,
    } = body;

    const resolvedAuthorId = authorId || userId;
    const resolvedCollegeId = collegeId;

    if (!type || !title || !description || !category || !location || !resolvedAuthorId || !resolvedCollegeId) {
      return NextResponse.json(
        { success: false, error: 'All primary fields (type, title, description, category, location, author, campus) are required.' },
        { status: 400 }
      );
    }

    // Verify user exists by id or clerkId
    let user = await prisma.user.findUnique({
      where: { id: resolvedAuthorId },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { clerkId: resolvedAuthorId },
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User profile not found. Please log in again.' },
        { status: 404 }
      );
    }

    // Verify college exists
    const college = await prisma.college.findUnique({
      where: { id: resolvedCollegeId },
    });

    let effectiveCollegeId = resolvedCollegeId;
    if (!college) {
      const fallbackCollege = (user.collegeId ? await prisma.college.findUnique({ where: { id: user.collegeId } }) : null)
        || await prisma.college.findFirst();
      if (!fallbackCollege) {
        return NextResponse.json(
          { success: false, error: 'College not found.' },
          { status: 404 }
        );
      }
      effectiveCollegeId = fallbackCollege.id;
    }

    const post = await prisma.lostFoundPost.create({
      data: {
        type,
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        dateLostFound: dateLostFound ? new Date(dateLostFound) : new Date(),
        contactInfo: contactInfo ? contactInfo.trim() : null,
        authorId: user.id,
        collegeId: effectiveCollegeId,
        images: {
          create: (Array.isArray(images) ? images : [])
            .filter((url: any) => typeof url === 'string' && url.trim().length > 0)
            .map((url: string) => ({ url: url.trim() })),
        },
      },
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

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error creating lost & found post:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create post' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET User Profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const username = searchParams.get('username');

    if (!userId && !email && !username) {
      return NextResponse.json(
        { success: false, error: 'User identifier required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          ...(email ? [{ email: email.toLowerCase() }] : []),
          ...(username ? [{ username }] : []),
        ],
      },
      include: {
        college: true,
        listings: {
          orderBy: { createdAt: 'desc' },
          include: {
            images: true,
          },
        },
        savedListings: {
          include: {
            listing: {
              include: {
                images: true,
                user: { select: { name: true, isVerified: true } },
              },
            },
          },
        },
        communityPosts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            community: { select: { name: true, slug: true } },
          },
        },
        lostFoundPosts: {
          orderBy: { createdAt: 'desc' },
          include: {
            images: true,
          },
        },
        _count: {
          select: {
            listings: true,
            savedListings: true,
            communityPosts: true,
            lostFoundPosts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// UPDATE User Profile
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, username, course, branch, gradYear, bio, avatar } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if username is already taken by another user
    if (username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: username.trim(),
          NOT: { id: userId },
        },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Username is already taken by another student.' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(username && { username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') }),
        ...(course !== undefined && { course: course?.trim() || null }),
        ...(branch !== undefined && { branch: branch?.trim() || null }),
        ...(gradYear !== undefined && { gradYear: gradYear ? parseInt(gradYear, 10) : null }),
        ...(bio !== undefined && { bio: bio?.trim() || null }),
        ...(avatar !== undefined && { avatar: avatar?.trim() || null }),
      },
      include: {
        college: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
        course: updatedUser.course,
        branch: updatedUser.branch,
        gradYear: updatedUser.gradYear,
        bio: updatedUser.bio,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        collegeId: updatedUser.collegeId,
        collegeName: updatedUser.college?.name || null,
        collegeShortName: updatedUser.college?.shortName || null,
      },
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

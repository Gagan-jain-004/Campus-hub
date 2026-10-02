import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const [
      totalUsers,
      activeListings,
      activeCommunities,
      activeLostFound,
      pendingReportsCount,
      reports,
      collegeRequests,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.community.count(),
      prisma.lostFoundPost.count({ where: { status: 'ACTIVE' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: {
          reporter: {
            select: {
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.collegeRequest.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.user.findMany({
        where: search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : undefined,
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          college: true,
          _count: {
            select: {
              listings: true,
              communityPosts: true,
              lostFoundPosts: true,
              comments: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeListings,
          activeCommunities,
          activeLostFound,
          pendingReportsCount,
        },
        reports,
        collegeRequests,
        recentUsers,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, id, status, adminNotes } = body;

    if (action === 'RESOLVE_REPORT') {
      const updated = await prisma.report.update({
        where: { id },
        data: {
          status: status || 'RESOLVED',
          adminNotes: adminNotes || null,
          resolvedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'MODERATE_COLLEGE_REQUEST') {
      const collegeReq = await prisma.collegeRequest.update({
        where: { id },
        data: { status },
      });

      if (status === 'APPROVED') {
        // Create the college in the main college table
        await prisma.college.create({
          data: {
            name: collegeReq.collegeName,
            shortName: collegeReq.shortName,
            city: collegeReq.city,
            state: collegeReq.state,
            verified: true,
          },
        }).catch(() => {});
      }

      return NextResponse.json({ success: true, data: collegeReq });
    }

    return NextResponse.json({ success: false, error: 'Unknown admin action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error executing admin action:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, clerkId: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Try deleting from Clerk if clerkId is set
    if (user.clerkId && process.env.CLERK_SECRET_KEY) {
      try {
        const { createClerkClient } = await import('@clerk/backend');
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        await clerk.users.deleteUser(user.clerkId).catch((err) => {
          console.warn('Clerk user delete warning:', err?.message || err);
        });
      } catch (clerkErr: any) {
        console.warn('Could not delete user from Clerk:', clerkErr?.message || clerkErr);
      }
    }

    // Delete user from Database (cascades delete all their listings, posts, tickets, comments, messages)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: `User ${user.name} (${user.email}) and all associated data were permanently deleted.`,
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

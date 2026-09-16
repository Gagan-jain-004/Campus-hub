import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
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
        take: 20,
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
        take: 20,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          college: true,
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

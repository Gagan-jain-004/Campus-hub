import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const [
      myListings,
      savedListings,
      myCommunities,
      myLostFound,
      notifications,
      unreadMessagesCount,
    ] = await Promise.all([
      prisma.listing.findMany({
        where: { userId },
        include: { images: true, college: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.savedListing.findMany({
        where: { userId },
        include: {
          listing: {
            include: { images: true, college: true, user: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.communityMember.findMany({
        where: { userId },
        include: {
          community: {
            include: {
              _count: { select: { members: true, posts: true } },
            },
          },
        },
      }),
      prisma.lostFoundPost.findMany({
        where: { authorId: userId },
        include: { images: true, college: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.message.count({
        where: {
          conversation: {
            participants: {
              some: { userId },
            },
          },
          senderId: { not: userId },
          readAt: null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        myListings,
        savedListings: savedListings.map((s) => s.listing),
        myCommunities: myCommunities.map((m) => m.community),
        myLostFound,
        notifications,
        unreadMessagesCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

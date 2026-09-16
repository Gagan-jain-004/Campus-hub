import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        listing: {
          include: {
            images: true,
          },
        },
        lostFoundPost: {
          include: {
            images: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                isVerified: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: conversations });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderId, recipientId, collegeId, listingId, lostFoundPostId, initialMessage } = body;

    if (!senderId || !recipientId || !collegeId) {
      return NextResponse.json({ success: false, error: 'Sender, recipient and college are required' }, { status: 400 });
    }

    // Check if conversation already exists between these users for this item
    let conversation = await prisma.conversation.findFirst({
      where: {
        collegeId,
        ...(listingId && { listingId }),
        ...(lostFoundPostId && { lostFoundPostId }),
        AND: [
          { participants: { some: { userId: senderId } } },
          { participants: { some: { userId: recipientId } } },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          collegeId,
          listingId: listingId || null,
          lostFoundPostId: lostFoundPostId || null,
          participants: {
            create: [
              { userId: senderId },
              { userId: recipientId },
            ],
          },
        },
      });
    }

    if (initialMessage) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId,
          content: initialMessage,
        },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true, data: conversation });
  } catch (error: any) {
    console.error('Error starting conversation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

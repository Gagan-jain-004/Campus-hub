import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reporterId, targetType, targetId, reason, description } = body;

    if (!reporterId || !targetType || !targetId || !reason) {
      return NextResponse.json({ success: false, error: 'All fields required' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        targetType,
        targetId,
        reason,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error('Error submitting report:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

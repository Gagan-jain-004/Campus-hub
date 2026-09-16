import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminEmail } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, collegeId, course, branch, gradYear } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const role = isAdminEmail(cleanEmail) ? 'ADMIN' : 'STUDENT';

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        college: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name?.trim() || cleanEmail.split('@')[0],
          username: cleanEmail.split('@')[0].replace(/[^a-z0-9]/gi, ''),
          role,
          collegeId: collegeId || null,
          course: course || null,
          branch: branch || null,
          gradYear: gradYear ? parseInt(gradYear) : null,
          isVerified: cleanEmail.includes('.edu') || cleanEmail.includes('.ac.in'),
        },
        include: {
          college: true,
        },
      });
    } else if (collegeId && !user.collegeId) {
      // Update college if missing
      user = await prisma.user.update({
        where: { id: user.id },
        data: { collegeId },
        include: { college: true },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        course: user.course,
        branch: user.branch,
        gradYear: user.gradYear,
        role: user.role,
        isVerified: user.isVerified,
        collegeId: user.collegeId,
        collegeName: user.college?.name || null,
        collegeShortName: user.college?.shortName || null,
      },
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

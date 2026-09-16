import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminEmail } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerkId, email, name, avatar, collegeId } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const role = isAdminEmail(cleanEmail) ? 'ADMIN' : 'STUDENT';

    // Find RTU Kota college record
    let rtuCollege = await prisma.college.findFirst({
      where: {
        OR: [
          { shortName: { contains: 'RTU', mode: 'insensitive' } },
          { name: { contains: 'Rajasthan Technical', mode: 'insensitive' } },
        ],
      },
    });

    if (!rtuCollege) {
      rtuCollege = await prisma.college.create({
        data: {
          name: 'Rajasthan Technical University (RTU Kota)',
          shortName: 'RTU Kota',
          city: 'Kota',
          state: 'Rajasthan',
          verified: true,
        },
      });
    }

    const assignedCollegeId = collegeId || rtuCollege.id;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(clerkId ? [{ clerkId }] : []),
          { email: cleanEmail },
        ],
      },
      include: {
        college: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: clerkId || null,
          email: cleanEmail,
          name: name?.trim() || cleanEmail.split('@')[0],
          username: cleanEmail.split('@')[0].replace(/[^a-z0-9]/gi, ''),
          avatar: avatar || null,
          role,
          collegeId: rtuCollege.id,
          isVerified: cleanEmail.includes('.edu') || cleanEmail.includes('.ac.in') || cleanEmail.includes('rtu.ac.in'),
        },
        include: {
          college: true,
        },
      });
    } else {
      // Update clerkId, avatar or assign RTU Kota college if missing
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(clerkId && { clerkId }),
          ...(avatar && { avatar }),
          collegeId: user.collegeId || rtuCollege.id,
          role: isAdminEmail(cleanEmail) ? 'ADMIN' : user.role,
        },
        include: {
          college: true,
        },
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
        role: user.role,
        isVerified: user.isVerified,
        collegeId: user.collegeId,
        collegeName: user.college?.name || null,
        collegeShortName: user.college?.shortName || null,
      },
    });
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { verifyAdminCredentials, getAdminEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminCredentials(email, password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    const adminEmail = getAdminEmail();

    // Check if admin user exists in DB, or create one
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    }).catch(() => null);

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'CampusHub Superadmin',
          username: 'superadmin',
          role: 'ADMIN',
          isVerified: true,
        },
      }).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: adminUser?.id || 'admin_master_id',
        name: adminUser?.name || 'CampusHub Superadmin',
        email: adminEmail,
        username: 'superadmin',
        role: 'ADMIN',
        isVerified: true,
        collegeId: null,
        collegeName: 'National Moderator Hub',
        collegeShortName: 'Superadmin',
      },
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

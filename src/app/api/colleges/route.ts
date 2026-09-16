import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Look for existing RTU Kota record in DB
    let rtuCollege = await prisma.college.findFirst({
      where: {
        OR: [
          { shortName: { contains: 'RTU', mode: 'insensitive' } },
          { name: { contains: 'Rajasthan Technical', mode: 'insensitive' } },
        ],
      },
      include: {
        _count: {
          select: {
            listings: { where: { status: 'ACTIVE' } },
            communities: true,
            lostFoundPosts: { where: { status: 'ACTIVE' } },
            users: true,
          },
        },
      },
    });

    if (!rtuCollege) {
      // Auto-provision RTU Kota as the default campus
      rtuCollege = await prisma.college.create({
        data: {
          name: 'Rajasthan Technical University (RTU Kota)',
          shortName: 'RTU Kota',
          city: 'Kota',
          state: 'Rajasthan',
          verified: true,
          communities: {
            create: [
              {
                name: 'Campus Confessions & Buzz',
                slug: 'campus-buzz',
                description: 'Anonymous confessions, daily banter, and hostel vibes at RTU Kota.',
                postingMode: 'BOTH',
              },
              {
                name: 'Buy & Sell Student Exchange',
                slug: 'marketplace-hub',
                description: 'Official RTU student trade and peer deals.',
                postingMode: 'IDENTIFIED',
              },
              {
                name: 'Exam, Notes & Placement Prep',
                slug: 'academics-placement',
                description: 'Shared semester notes, RTU papers, and placement prep.',
                postingMode: 'IDENTIFIED',
              },
              {
                name: 'Lost & Found Recovery Radar',
                slug: 'lost-and-found',
                description: 'RTU Kota campus lost items registry and recovery claims.',
                postingMode: 'IDENTIFIED',
              },
            ],
          },
        },
        include: {
          _count: {
            select: {
              listings: true,
              communities: true,
              lostFoundPosts: true,
              users: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: [
        {
          id: rtuCollege.id,
          name: 'Rajasthan Technical University (RTU Kota)',
          shortName: 'RTU Kota',
          city: 'Kota',
          state: 'Rajasthan',
          verified: true,
          _count: rtuCollege._count,
        },
      ],
    });
  } catch (error: any) {
    console.error('Error fetching colleges:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Provision or request college
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, name, shortName, city, state, collegeName, email } = body;

    // Direct provision / create college in DB
    if (action === 'PROVISION' || (!action && name && shortName)) {
      const colName = (name || collegeName).trim();
      const colShort = (shortName || colName.split(' ')[0]).trim();
      const colCity = (city || 'Main Campus').trim();
      const colState = (state || 'India').trim();

      let college = await prisma.college.findFirst({
        where: {
          OR: [
            { name: { equals: colName, mode: 'insensitive' } },
            { shortName: { equals: colShort, mode: 'insensitive' } },
          ],
        },
      });

      if (!college) {
        college = await prisma.college.create({
          data: {
            name: colName,
            shortName: colShort,
            city: colCity,
            state: colState,
            verified: true,
            communities: {
              create: [
                {
                  name: 'Campus Confessions & Buzz',
                  slug: 'campus-buzz',
                  description: 'Anonymous confessions, daily banter, and hostel vibes.',
                  postingMode: 'BOTH',
                },
                {
                  name: 'Buy & Sell Student Exchange',
                  slug: 'marketplace-hub',
                  description: 'Official verified student trade and peer deals.',
                  postingMode: 'IDENTIFIED',
                },
                {
                  name: 'Exam, Notes & Placement Prep',
                  slug: 'academics-placement',
                  description: 'Shared notes, semester question papers, and interview prep.',
                  postingMode: 'IDENTIFIED',
                },
                {
                  name: 'Lost & Found Recovery Radar',
                  slug: 'lost-and-found',
                  description: 'Campus-wide lost items registry and recovery claims.',
                  postingMode: 'IDENTIFIED',
                },
              ],
            },
          },
        });
      }

      return NextResponse.json({ success: true, data: college });
    }

    // Otherwise register a college expansion request
    if (!collegeName || !shortName || !city || !state || !email) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const collegeReq = await prisma.collegeRequest.create({
      data: {
        collegeName,
        shortName,
        city,
        state,
        email,
      },
    });

    return NextResponse.json({ success: true, data: collegeReq });
  } catch (error: any) {
    console.error('Error handling college request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

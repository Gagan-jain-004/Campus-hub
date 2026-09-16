import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId') || undefined;
    const category = searchParams.get('category');
    const condition = searchParams.get('condition');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    const where: any = {
      status: 'ACTIVE',
    };

    if (collegeId) {
      where.collegeId = collegeId;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (condition && condition !== 'ALL') {
      where.condition = condition;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_low') orderBy = { price: 'asc' };
    if (sort === 'price_high') orderBy = { price: 'desc' };
    if (sort === 'views') orderBy = { views: 'desc' };

    const listings = await prisma.listing.findMany({
      where,
      orderBy,
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            isVerified: true,
            branch: true,
            gradYear: true,
          },
        },
        college: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        _count: {
          select: {
            savedBy: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: listings });
  } catch (error: any) {
    console.error('Error fetching marketplace listings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      price,
      condition,
      negotiable,
      location,
      images,
      userId,
      collegeId,
    } = body;

    if (!title || !description || !category || price === undefined || !condition || !collegeId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Required listing fields missing' },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        category,
        price: parseFloat(price),
        condition,
        negotiable: negotiable ?? true,
        location: location || 'Campus Area',
        userId,
        collegeId,
        images: {
          create: (images || []).map((url: string) => ({ url })),
        },
      },
      include: {
        images: true,
        college: true,
        user: true,
      },
    });

    return NextResponse.json({ success: true, data: listing });
  } catch (error: any) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

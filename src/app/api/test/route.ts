import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database connected!',
      userCount
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: String(error)
    }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';

export async function GET() {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin session error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify admin session',
      },
      { status: 500 }
    );
  }
}
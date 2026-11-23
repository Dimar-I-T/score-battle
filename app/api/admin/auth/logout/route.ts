import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db/config';

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('session_id')?.value;

    if (sessionId) {
      await pool.query(
        `DELETE FROM sessions
         WHERE session_id = $1`,
        [sessionId]
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.cookies.set('session_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Admin logout error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to logout',
      },
      { status: 500 }
    );
  }
}
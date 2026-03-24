import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/backend/modules/auth/auth.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const schoolCode = typeof body?.organizationId === 'string' ? body.organizationId : undefined;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const result = await authService.login(email, password, schoolCode, req.ip || 'unknown');
    return NextResponse.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('[API_AUTH_LOGIN_ERROR]:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Login failed',
      details: error.response?.data?.error
    }, { status: error.statusCode || 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/backend/modules/auth/auth.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organization, admin } = body;
    
    if (!organization || !admin) {
      return NextResponse.json({ success: false, error: 'Organization and Admin details are required' }, { status: 400 });
    }

    const result = await authService.register(organization, admin);
    return NextResponse.json({ success: true, data: result, message: 'Organization registered successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('[API_AUTH_REGISTER_ERROR]:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Registration failed',
      details: error.response?.data?.error
    }, { status: error.statusCode || 500 });
  }
}

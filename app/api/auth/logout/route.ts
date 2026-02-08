import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Needed to manipulate cookies
import { createSuccessResponse, createErrorResponse } from '../../lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
   
    // This tells the browser to expire the cookie immediately
    cookieStore.delete('auth-token');

   
    return createSuccessResponse({
      message: 'Logout successful and cookie cleared',
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    return createErrorResponse('Failed to logout', 500);
  }
}
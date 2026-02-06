// ============================================
// app/api/auth/logout/route.ts
// ============================================

import { NextRequest } from 'next/server';
import { requireAuth, createSuccessResponse, createErrorResponse } from '../../lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    
    await requireAuth(request);
    
    
    
    return createSuccessResponse({
      message: 'Logout successful',
    });
    
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return createErrorResponse('Unauthorized', 401);
    }
    
    console.error('Logout error:', error);
    return createErrorResponse('Failed to logout', 500);
  }
}